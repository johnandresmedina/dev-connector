const express = require("express");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

const router = express.Router();

// @route GET api/auth
// @desc Test route
// @access Public
router.get("/", auth, async (request, response) => {
  try {
    const user = await User.findById(request.user.id).select("-password");
    response.json(user);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

module.exports = router;
