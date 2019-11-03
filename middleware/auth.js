const jwt = require("jsonwebtoken");
const config = require("config");

const authMiddleWare = function(request, response, next) {
  const token = request.header("x-auth-token");

  if (!token) {
    return response.status(401).json({ msg: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, config.get("jwtSecret"));
    request.user = decoded.user;

    next();
  } catch (error) {
    response.status(401).json({ msg: "Token is not valid" });
  }
};

module.exports = authMiddleWare;
