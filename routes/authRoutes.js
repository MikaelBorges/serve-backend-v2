const withAuth = require("../withAuth");

module.exports = (app, db) => {
  const userModel = require("../models/userModel");
  app.get("/api/checkToken", withAuth, async (req, res, next) => {
    // Warning : bug avec la recherche par email .findOne({mail}) ça me sort l'user John Doe
    const user = await userModel.findById(req._id);
    const userIdToken = req._id;
    const userIdFromDb = user._id.toString();

    if (userIdToken !== userIdFromDb) {
      res.json({ status: 500, err: user });
    } else {
      res.json({ status: 200, msg: "token valide", user: user });
    }
  });
};
