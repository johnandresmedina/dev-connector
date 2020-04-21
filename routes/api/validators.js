const { check, validationResult } = require("express-validator");

const validateComment = async (request, response, next) => {
  await Promise.all([
    check("text", "Text is required").not().isEmpty().run(request),
  ]);

  validate(request, response, next);
};

const validate = (request, response, next) => {
  const errors = validationResult(request);

  if (!errors.isEmpty()) {
    return response.status(400).json({ errors: errors.array() });
  }

  next();
};

module.exports = { validateComment };
