const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("./../../config/keys");
const passport = require("passport");
const validateRegisterInput = require("../../validator/register");
const validateLoginInput = require("../../validator/login");

// @route   GET api/users/registe
// @desc    to register new users
// @access  Public
router.post("/register", (req, res) => {
  const { errors, isValid } = validateRegisterInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      res.status(400).json({
        email: "this email is already exist. Please use another email or login"
      });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //size,
        r: "pg", //rating
        d: "mm" // default
      });
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => res.send(err));
        });
      });
    }
  });
});

// @route   GET api/users/login
// @desc    to login the new users
// @access  Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const { errors, isValid } = validateLoginInput(req.body);
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ email }).then(user => {
    if (!user) {
      errors.email = "User not found";
      res.status(404).json(errors);
    } else {
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          const payload = {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          };
          jwt.sign(payload, keys.secret, (err, token) => {
            res.json({
              success: true,
              token: "Bearer " + token
            });
          });
        } else {
          errors.password = "Password Incorrect";
          res.json(errors);
        }
      });
    }
  });
});

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);
module.exports = router;
