const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const { validateComment } = require('./validators');
const User = require('../../models/User');
const Post = require('../../models/Post');

const router = express.Router();

// @route POST api/posts
// @desc Create a post
// @access Private
router.post(
  '/',
  [auth, [check('text', 'Text is required').not().isEmpty()]],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = request.user.id;
      const user = await User.findById(userId).select('-password');
      const { name, avatar } = user;

      const newPost = new Post({
        text: request.body.text,
        name,
        avatar,
        user: userId,
      });

      const post = await newPost.save();
      return response.json(post);
    } catch (error) {
      console.error(error.message);
      return response.status(500).send('Server error');
    }
  },
);

// @route GET api/posts
// @desc Get all posts
// @access Private
router.get('/', auth, async (request, response) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    return response.json(posts);
  } catch (error) {
    console.error(error.message);
    return response.status(500).send('Server error');
  }
});

// @route GET api/posts/:id
// @desc Get post by Id
// @access Private
router.get('/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    return response.json(post);
  } catch (error) {
    console.error(error.message);

    if (error.kind === 'ObjectId') {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    return response.status(500).send('Server error');
  }
});

// @route DELETE api/posts/:id
// @desc Delete post by Id
// @access Private
router.delete('/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (!post) {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    if (post.user.toString() !== request.user.id) {
      return response.status(401).json({ errors: { msg: 'User not authorized' } });
    }

    await post.remove();
    return response.json({ msg: 'Post removed' });
  } catch (error) {
    console.error(error.message);

    if (error.kind === 'ObjectId') {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    return response.status(500).send('Server error');
  }
});

// @route PUT api/posts/like/:id
// @desc Like a post
// @access Private
router.put('/like/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);

    if (post.likes.filter(like => like.user.toString() === request.user.id).length > 0) {
      return response.status(400).json({ errors: { msg: 'Post already liked' } });
    }

    post.likes.unshift({ user: request.user.id });
    await post.save();

    return response.json(post.likes);
  } catch (error) {
    console.error(error.message);

    if (error.kind === 'ObjectId') {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    return response.status(500).send('Server error');
  }
});

// @route PUT api/posts/unlike/:id
// @desc Like a post
// @access Private
router.put('/unlike/:id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    if (post.likes.filter(like => like.user.toString() === request.user.id).length === 0) {
      return response.status(400).json({ errors: { msg: 'Post has not yet been liked' } });
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(request.user.id);

    post.likes.splice(removeIndex, 1);
    await post.save();

    return response.json(post.likes);
  } catch (error) {
    console.error(error.message);

    if (error.kind === 'ObjectId') {
      return response.status(404).json({ errors: { msg: 'Post not found' } });
    }

    return response.status(500).send('Server error');
  }
});

// @route PUT api/posts/comment/:id
// @desc Comment on a post
// @access Private
router.put('/comment/:id', [auth, validateComment], async (request, response) => {
  try {
    const userId = request.user.id;
    const user = await User.findById(userId).select('-password');
    const post = await Post.findById(request.params.id);

    const { name, avatar } = user;

    const newComment = {
      text: request.body.text,
      name,
      avatar,
      user: userId,
    };

    post.comments.unshift(newComment);
    await post.save();

    return response.json(post.comments);
  } catch (error) {
    console.error(error.message);
    return response.status(500).send('Server error');
  }
});

// @route DELETE api/posts/comment/:id/:comment_id
// @desc Delete a comment
// @access Private
router.delete('/comment/:id/:comment_id', auth, async (request, response) => {
  try {
    const post = await Post.findById(request.params.id);
    const comment = post.comments.find(({ id }) => id === request.params.comment_id);

    if (!comment) {
      return response.status(404).json({ errors: { msg: 'Comment not found' } });
    }

    if (comment.user.toString() !== request.user.id) {
      return response.status(401).json({ errors: { msg: 'User not authorized' } });
    }

    post.comments = post.comments.filter(({ id }) => id !== comment.id);

    await post.save();

    return response.json(post.comments);
  } catch (error) {
    console.error(error.message);
    return response.status(500).send('Server error');
  }
});

module.exports = router;
