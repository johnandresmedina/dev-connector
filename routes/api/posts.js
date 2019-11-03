const express = require("express");
const router = express.Router();

// @route GET api/posts
// @desc Test route
// @access Public
router.get("/", (request, response) => response.send("Posts route"));

module.exports = router;
