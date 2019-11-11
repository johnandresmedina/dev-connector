const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

const router = express.Router();

// @route GET api/profile/me
// @desc Get current user's profile
// @access Private
router.get("/me", auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return response
        .status(400)
        .json({ errors: [{ msg: "There is no profile for this user" }] });
    }

    response.json(profile);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route POST api/profile
// @desc Create or update a user's profile
// @access Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required")
        .not()
        .isEmpty(),
      check("skills", "Skills is required")
        .not()
        .isEmpty()
    ]
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = request.body;

    const profileFields = {};
    profileFields.user = request.user.id;

    profileFields["company"] = company || "";
    profileFields["website"] = website || "";
    profileFields["location"] = location || "";
    profileFields["bio"] = bio || "";
    profileFields["status"] = status || "";
    profileFields["githubusername"] = githubusername || "";

    if (skills) {
      profileFields.skills = skills.split(",").map(skill => skill.trim());
    }

    profileFields.social = {};
    profileFields.social["youtube"] = youtube || "";
    profileFields.social["twitter"] = twitter || "";
    profileFields.social["facebook"] = facebook || "";
    profileFields.social["linkedin"] = linkedin || "";
    profileFields.social["instagram"] = instagram || "";

    try {
      let profile = await Profile.findOne({ user: request.user.id });

      if (profile) {
        profile = await Profile.findOneAndUpdate(
          { user: request.user.id },
          {
            $set: profileFields
          },
          { new: true }
        );
      } else {
        profile = new Profile(profileFields);
        await profile.save();
      }

      return response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server error");
    }
  }
);

// @route GET api/profile
// @desc Get all profiles
// @access Public
router.get("/", async (request, response) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    response.json(profiles);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route GET api/profile/user/:user_id
// @desc Get a profile by user id
// @access Public
router.get("/user/:user_id", async (request, response) => {
  try {
    const profile = await Profile.findOne({
      user: request.params.user_id
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return response
        .status(400)
        .json({ errors: [{ msg: "Profile not found" }] });
    }

    response.json(profile);
  } catch (error) {
    console.error(error.message);

    if (error.kind == "ObjectId") {
      return response
        .status(400)
        .json({ errors: [{ msg: "Profile not found" }] });
    }
    response.status(500).send("Server error");
  }
});

// @route DELETE api/profile
// @desc Delete profile, user & posts
// @access Private
router.delete("/", auth, async (request, response) => {
  try {
    await Profile.findOneAndRemove({ user: request.user.id });
    await User.findOneAndRemove({ _id: request.user.id });

    response.json({ msg: "User deleted" });
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

module.exports = router;
