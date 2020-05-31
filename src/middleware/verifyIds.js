const mongoose = require('mongoose');

const verifyId = (request, response, next) => {
  const { id } = request.params;

  if (mongoose.isValidObjectId(id)) {
    next();
  } else {
    response.status(400).json({ errors: [{ msg: `The parameter '${id}' is not valid` }] });
  }
};

module.exports = { verifyId };
