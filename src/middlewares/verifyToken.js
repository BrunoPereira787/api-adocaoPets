const jwt = require("jsonwebtoken");

const getToken = require("../middlewares/getToken");

const verifyToken = (req, res, next) => {
  if (!req.headers.authorization) {
    return res.status(401).json({ message: "Acesso negado" });
  }

  const token = getToken(req);

  if (!token) {
    return res.status(401).json({ message: "Acesso negado" });
  }
  try {
    const verified = jwt.verify(token, process.env.SECRET_JWT);
    req.user = verified;
    next();
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

module.exports = verifyToken;
