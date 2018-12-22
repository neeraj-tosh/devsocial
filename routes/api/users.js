const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const User = require("../../models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("./../../config/keys");
const passport = require("passport");
// @route   GET api/users/test
// @desc    to test user route
// @access  Public
router.get("/test", (req, res) => res.json({ message: "user works" }));

// @route   GET api/users/registe
// @desc    to register new users
// @access  Public
router.post("/register", (req, res) => {
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

  User.findOne({ email }).then(user => {
    if (!user) {
      res.status(404).json({ email: "this email address does not exist." });
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
          res.json({ msg: "Password is incorrect" });
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
