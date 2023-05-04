const jwt = require("jsonwebtoken");

const createUserToken = (user, req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.SECRET_JWT, {
    expiresIn: 86400,
  });
  res.status(200).json({
    message: "Usuario autenticado",
    token,
    userId: user._id,
  });
};

module.exports = createUserToken;
