const jwt = require("jsonwebtoken");
const secret = process.env.TOKEN_SECRET;

const withAuth = (req, res, next) => {
  const token = req.headers["x-access-token"];
  jwt.verify(token, secret, (err, decode) => {
    if (err) {
      res.json({ status: 401, err: err });
    } else {
      req._id = decode._id;
      req.email = decode.email;
      next();
    }
  });
};

module.exports = withAuth;
