const mongoose = require('mongoose');

const errorHandler = (error, request, response) => {
  console.error(error.message);

  if (error instanceof mongoose.Error.CastError) {
    return response
      .status(404)
      .json({ errors: [{ msg: `Resource with id '${error.value}' was not found` }] });
  }

  return response.status(500).json('Server error');
};

module.exports = { errorHandler };
