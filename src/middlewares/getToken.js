const getToken = (req) => {
  const getToken = req.headers.authorization;
  const [, token] = getToken.split(" ");
  return token;
};

module.exports = getToken;
