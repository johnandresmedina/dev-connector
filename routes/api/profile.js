const express = require("express");
const { check, validationResult } = require("express-validator");
const requestAPI = require("request");
const config = require("config");

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

// @route PUT api/profile/experience
// @desc Add profile experience
// @access Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required")
        .not()
        .isEmpty(),
      check("company", "Company is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
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
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = request.body;

    const newExperience = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: request.user.id });
      profile.experience.unshift(newExperience);
      await profile.save();

      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server error");
    }
  }
);

// @route DELETE api/profile/experience/:exp_id
// @desc Delete experience from profile
// @access Private
router.delete("/experience/:exp_id", auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user.id });
    const removeIndex = profile.experience
      .map(item => item.id)
      .indexOf(request.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    response.json(profile);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route PUT api/profile/education
// @desc Add profile education
// @access Private
router.put(
  "/education",
  [
    auth,
    [
      check("school", "School is required")
        .not()
        .isEmpty(),
      check("degree", "Degree is required")
        .not()
        .isEmpty(),
      check("fieldofstudy", "Study is required")
        .not()
        .isEmpty(),
      check("from", "From date is required")
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
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = request.body;

    const newEducation = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: request.user.id });
      profile.education.unshift(newEducation);
      await profile.save();

      response.json(profile);
    } catch (error) {
      console.error(error.message);
      response.status(500).send("Server error");
    }
  }
);

// @route DELETE api/profile/education/:exp_id
// @desc Delete education from profile
// @access Private
router.delete("/education/:edu_id", auth, async (request, response) => {
  try {
    const profile = await Profile.findOne({ user: request.user.id });
    const removeIndex = profile.education
      .map(item => item.id)
      .indexOf(request.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();

    response.json(profile);
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

// @route GET api/profile/github/:username
// @desc Get user repos from Github
// @access Public
router.get("/github/:username", async (request, response) => {
  try {
    const githubClientId = config.get("githubClientId");
    const githubClientSecret = config.get("githubClientSecret");
    const options = {
      uri: `https://api.github.com/users/${request.params.username}/repos?per_page=5&sort=created:asc&client_id=${githubClientId}&client_secret=${githubClientSecret}`,
      method: "GET",
      headers: { "user-agent": "dev-connector" }
    };

    requestAPI(options, (error, responseResult, body) => {
      if (error) {
        console.error(error);
      }

      if (responseResult.statusCode !== 200) {
        return response
          .status(404)
          .json({ errors: { msg: "Not Github profile found" } });
      }

      return response.json(JSON.parse(body));
    });
  } catch (error) {
    console.error(error.message);
    response.status(500).send("Server error");
  }
});

module.exports = router;
