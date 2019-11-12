const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const User = require("../../models/User");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");

const router = express.Router();

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("text", "Text is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = request.user.id;
      const user = await User.findById(userId).select("-password");
      const { name, avatar } = user;

      const newPost = new Post({
        text: request.body.text,
        name,
        avatar,
        user: userId
      });

      const post = await newPost.save();
      response.json(post);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server error");
    }
  }
);

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get("/", auth, async (request, response) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    response.json(posts);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route GET api/posts/:id
// @desc Get post by Id
// @access Private
router.get("/:id", auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ errors: { msg: "Post not found" } });
    }

    response.json(post);
  } catch (error) {
    console.error(error.message);

    if (error.kind == "ObjectId") {
      return response.status(404).json({ errors: { msg: "Post not found" } });
    }

    response.status(500).send("Server error");
  }
});

// @route DELETE api/posts/:id
// @desc Delete post by Id
// @access Private
router.delete("/:id", auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ errors: { msg: "Post not found" } });
    }

    if (post.user.toString() !== request.user.id) {
      return response
        .status(401)
        .json({ errors: { msg: "User not authorized" } });
    }

    await post.remove();
    response.json({ msg: "Post removed" });
  } catch (error) {
    console.error(error.message);

    if (error.kind == "ObjectId") {
      return response.status(404).json({ errors: { msg: "Post not found" } });
    }

    response.status(500).send("Server error");
  }
});

module.exports = router;
