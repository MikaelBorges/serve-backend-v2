const saltRounds = 10;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.TOKEN_SECRET;

module.exports = (app, db) => {
  const userModel = require("../models/userModel");
  const adModel = require("../models/annoncesModel");

  app.post("/user/changeUserData/:id", async (req, res, next) => {
    const userId = req.params.id;
    const { firstname, lastname, email, password, phone } = req.body;
    try {
      if (!email || typeof email !== "string")
        return res.status(400).json({ message: "email vide" });
      if (!password || typeof password !== "string")
        return res.status(400).json({ message: "mot de passe vide" });
      if (password.length < 3)
        return res.status(400).json({ message: "mot de passe trop court" });
      const cryptedPass = await bcrypt.hash(req.body.password, saltRounds);
      const firstLetterOfFirstname = firstname[0].toUpperCase();
      const firstLetterOfLastname = lastname[0].toUpperCase();
      const initials = firstLetterOfFirstname + firstLetterOfLastname;

      await userModel.updateOne(
        { _id: userId },
        {
          tel: phone,
          email: email,
          hash: cryptedPass,
          lastname: lastname,
          firstname: firstname,
          initials: initials,
        }
      );
      res.json({
        userUpdateForContext: { firstname, initials },
        message: "Compte bien modifié",
      });
    } catch (error) {
      if (error.code === 11000)
        return res.status(400).json({ message: "Email déjà utilisé" });
      throw error;
    }
  });

  app.post("/user/register", async (req, res, next) => {
    const { firstname, lastname, email, password, phone } = req.body;
    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "email vide" });
    }
    if (!password || typeof password !== "string") {
      return res.status(400).json({ message: "mot de passe vide" });
    }
    if (password.length < 3) {
      return res.status(400).json({ message: "mot de passe trop court" });
    }
    const cryptedPass = await bcrypt.hash(req.body.password, saltRounds);
    const firstLetterOfFirstname = firstname[0].toUpperCase();
    const firstLetterOfLastname = lastname[0].toUpperCase();
    const initials = firstLetterOfFirstname + firstLetterOfLastname;

    try {
      let user = {
        phone,
        starsNb: 0,
        email,
        role: "user",
        reviewsNb: 0,
        imageUser: "",
        levelUser: "",
        hash: cryptedPass,
        lastname,
        firstname,
        initials,
      };
      const newUser = new userModel(user);
      newUser.save(function (err, doc) {
        if (err) res.status(500).json({ message: "Echec ajout user" });
        const userId = doc._id.toString();
        res.status(200).json({
          message: "Votre compte a bien été créé",
          userIdCreated: userId,
        });
      });
    } catch (error) {
      if (error.code === 11000)
        return res.status(400).json({ message: "Email déjà utilisé" });
      throw error;
    }
  });

  app.post("/user/login", async (req, res, next) => {
    const { email, password } = req.body;
    try {
      let user = await userModel.findOne({ email });
      if (!user) res.status(400).json({ message: "L'email est introuvable" });
      else {
        const isMatch = await bcrypt.compare(password, user.hash);
        if (!isMatch)
          res.status(400).json({ message: "Le mot de passe est incorrect" });
        else {
          const dataToUse = {
            _id: user._id,
            tel: user.tel,
            ads: user.ads,
            role: user.role,
            email: user.email,
            starsNb: user.starsNb,
            lastname: user.lastname,
            imageUser: user.imageUser,
            reviewsNb: user.reviewsNb,
            levelUser: user.levelUser,
            firstname: user.firstname,
            favorites: user.favorites,
            adsWithImages: user.adsWithImages,
            initials: user.initials,
          };
          const payload = { _id: user._id, email: user.email };
          const token = jwt.sign(payload, secret);
          req.session.user = dataToUse;
          req.session.isLogged = true;
          res.status(200).json({
            session: req.session,
            token: token,
            message: "Le mot de passe est correct",
          });
        }
      }
    } catch (e) {
      res.json({ status: 500, message: "Erreur du serveur!" });
    }
  });

  app.post("/user/logout", async (req, res, next) => {
    req.session.destroy((err) => {
      if (err) {
        res.json({
          status: 500,
          id: req.body.id,
          message: "Echec déconnexion",
          result: err,
        });
      } else {
        res.json({
          _id: req.body.id,
          message: "Session détruite côté backend, déconnexion bien effectuée",
        });
      }
    });
  });

  app.get("/user/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
      let user = await userModel.findById(id);
      if (!user) {
        res.status(400).json(null);
      } else {
        const { imageUser, levelUser, starsNb, firstname, initials } = user;
        const adsOfUser = await adModel.find({ userId: id });
        if (adsOfUser.length) {
          const buildCard = async () => {
            const allCardsAds = [];
            for (const ad of adsOfUser) {
              const card = {
                ...ad._doc,
                imageUser,
                levelUser,
                starsNb,
                initials,
              };
              allCardsAds.push(card);
            }
            return allCardsAds;
          };
          const allCardsAds = await buildCard();
          res.json({
            userAds: allCardsAds,
            userFirstname: firstname,
            status: 200,
          });
        } else {
          res.json({ userAds: [], userFirstname: firstname, status: 200 });
        }
      }
    } catch (error) {
      res.status(500).json({ message: "Erreur du serveur!" });
      throw error;
    }
  });

  app.get("/retrieveUser/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
      let user = await userModel.findById(id);
      if (!user) {
        res.status(400).json(null);
      } else {
        const { imageUser, email, phone, firstname, lastname } = user;
        const userInfo = {
          imageUser,
          lastname,
          email,
          phone,
          firstname,
        };
        res.json({ userInfo });
      }
    } catch (error) {
      res.status(500).json({ message: "Erreur du serveur!" });
      throw error;
    }
  });
};
