const express = require("express");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const auth = require("../../middleware/auth");
const User = require("../../models/User");

const router = express.Router();

// @route GET api/auth
// @desc Test route
// @access Private
router.get("/", auth, async (request, response) => {
  try {
    const user = await User.findById(request.user.id).select("-password");
    response.json(user);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route GET api/auth
// @desc Login user
// @access Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ error: errors.array() });
    }

    const { email, password } = request.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return response
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (error, token) => {
          if (error) throw error;
          response.json({ token });
        }
      );
    } catch (error) {
      console.error(err.message);
      response.status(500).send("Server error");
    }
  }
);

module.exports = router;
