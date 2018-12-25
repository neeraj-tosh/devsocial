const express = require("express");
const router = express.Router();
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const mongoose = require("mongoose");
const passport = require("passport");
const validatePostInput = require("./../../validator/post");

router.get("/test", (req, res) => res.json({ message: "posts works" }));

// @route   POST api/posts
// @desc    Create new post
// @access  Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);
    if (!isValid) {
      res.status(400).json(errors);
    }
    const newPost = new Post({
      user: req.user.id,
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route   GET api/posts
// @desc    get all posts
// @access  Private
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(400).json({ msg: "no post found" }));
});

// @route   GET api/posts/:id
// @desc    get post by id
// @access  Private
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ error: "No post found by this id" }));
});

// @route   Delete api/posts/:post_id
// @desc    delete post
// @access  Private
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findOne(req.params.id).then(post => {
        console.log(post.user);
        if (post.user.toString() !== req.user.id) {
          res.status(401).json({
            unauthorised: "you are not authorised to delete this post"
          });
        }
        post
          .remove()
          .then(() => {
            res.json({ success: true });
          })
          .catch(err => {
            res.status(404).json({ nopost: "no post found" });
          });
      });
    });
  }
);

// @route   Post api/posts/like/:id
// @desc    delete post
// @access  Private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length > 0
          ) {
            return res
              .status(400)
              .json({ alreadyliked: "User already liked this post" });
          }

          // Add user id to likes array
          post.likes.unshift({ user: req.user.id });

          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

// @route   POST api/posts/unlike/:id
// @desc    Unlike post
// @access  Private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id }).then(profile => {
      Post.findById(req.params.id)
        .then(post => {
          if (
            post.likes.filter(like => like.user.toString() === req.user.id)
              .length === 0
          ) {
            return res
              .status(400)
              .json({ notliked: "You have not yet liked this post" });
          }

          // Get remove index
          const removeIndex = post.likes
            .map(item => item.user.toString())
            .indexOf(req.user.id);

          // Splice out of array
          post.likes.splice(removeIndex, 1);

          // Save
          post.save().then(post => res.json(post));
        })
        .catch(err => res.status(404).json({ postnotfound: "No post found" }));
    });
  }
);

module.exports = router;
