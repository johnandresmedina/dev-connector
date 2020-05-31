const { check, validationResult } = require('express-validator');

const validate = (request, response, next) => {
  const errors = validationResult(request);

  if (errors.isEmpty()) {
    next();
  } else {
    response.status(400).json({ errors: errors.array() });
  }
};

const validateComment = async (request, response, next) => {
  await Promise.all([check('text', 'Text is required').not().isEmpty().run(request)]);

  validate(request, response, next);
};

const validatePost = async (request, response, next) => {
  await Promise.all([check('text', 'Text is required').not().isEmpty().run(request)]);

  validate(request, response, next);
};

module.exports = { validateComment, validatePost };
