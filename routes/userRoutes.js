// module pour crypter et comparer par un mot de passe
const saltRounds = 10;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.TOKEN_SECRET;
const withAuth = require("../withAuth");
const cloudinary = require("../utils/cloudinary");

module.exports = (app, db) => {
  const userModel = require("../models/userModel");
  const adModel = require("../models/annoncesModel");

  // route post d'une annonce favorite
  app.post("/addToFavorites", withAuth, async (req, res, next) => {
    if (req._id) console.log("id issu du token", req._id);
    //console.log('req.body', req.body)
    const adId = req.body.adId;
    console.log("adId", adId);
    const userId = req._id;
    const user = await userModel.findOne({ _id: userId });
    if (!user) {
      res
        .status(400)
        .json({ message: "L'user à l'initiative est introuvable" });
    } else {
      // si absent du tableau alors on ajoute :
      const index = user.favorites.indexOf(adId);
      const ad = await adModel.findOne({ _id: adId });
      if (index === -1) {
        console.log("ajout");
        await userModel.updateOne(
          { _id: userId },
          { $push: { favorites: adId } }
        );
        const favNb = ++ad.favoritesNb;
        await adModel.updateOne({ _id: adId }, { favoritesNb: favNb });
        res.status(200).json({
          newFavNumber: favNb,
          message: "Annonce bien ajoutée aux favoris",
        });
      } else {
        console.log("suppression");
        await userModel.updateOne(
          { _id: userId },
          { $pull: { favorites: adId } }
        );
        const favNb = --ad.favoritesNb;
        await adModel.updateOne({ _id: adId }, { favoritesNb: favNb });
        res.status(200).json({
          newFavNumber: favNb,
          message: "Annonce bien supprimée des favoris",
        });
      }
    }
  });

  /*---------------------------------------*/

  //route de modification d'une image
  /* app.post('/user/updateImg', async (req, res, next) =>  {
    const imageUser = req.body.imageUser
    let imageRetrieved = await userModel.findOne({imageUser})

    if(image === '') {
      res.json({status: 500, error : imageRetrieved})
    }

    res.json({status: 200, result: imageRetrieved})
  }) */

  /*---------------------------------------*/

  app.post("/user/registerUserImage", async (req, res, next) => {
    const { userIdCreated, urlUserImage } = req.body;
    await userModel.updateOne(
      { _id: userIdCreated },
      { imageUser: urlUserImage }
    );
    res.status(200).json({ message: "Photo de profil bien enregistrée" });
  });

  /* app.post('/user/deleteAccount/:id', async (req, res, next) => {
    const userId = req.params.id

    console.log('userId')
    console.log(userId)

    userModel.findByIdAndDelete(userId, function (err) {
      if(err) {
        console.log('Erreur dans la suppression du compte')
        res.status(500).json({message: 'Erreur dans la suppression du compte'})
      }
      else {
        console.log('compte bien supprimé')
        res.status(200).json({message: 'Votre compte a bien été supprimé'})
      }
    })
  }) */

  app.post("/user/changeUserData/:id", async (req, res, next) => {
    const userId = req.params.id;
    const {
      firstname,
      lastname,
      email,
      password,
      phone,
      imageUser,
      deleteImageAndFolder,
      replaceImage,
    } = req.body;
    console.log("req.body", req.body);
    try {
      let elementToDelete;
      if (deleteImageAndFolder || (!deleteImageAndFolder && replaceImage)) {
        const user = await userModel.findById(userId);
        const tempArray = user.imageUser.split("/");
        const lastElement = tempArray[tempArray.length - 1];
        const file = lastElement.split(".");
        elementToDelete = file[0];
        console.log("IMAGE A SUPPRIMER ?", elementToDelete);
      }
      if (!email || typeof email !== "string")
        return res.status(400).json({ message: "email vide" });
      if (!password || typeof password !== "string")
        return res.status(400).json({ message: "mot de passe vide" });
      if (password.length < 5)
        return res.status(400).json({ message: "mot de passe trop court" });
      const cryptedPass = await bcrypt.hash(req.body.password, saltRounds);
      await userModel.updateOne(
        { _id: userId },
        {
          tel: phone,
          email: email,
          hash: cryptedPass,
          lastname: lastname,
          firstname: firstname,
          imageUser: imageUser,
        }
      );

      await adModel.updateMany(
        { userId: { $in: [userId] } },
        { imageUser: imageUser }
      );

      if (deleteImageAndFolder) {
        cloudinary.api.delete_resources_by_prefix(
          `users/${userId}/profile/${elementToDelete}`,
          async function (err) {
            if (!err) {
              console.log("Image de profil bien supprimée");
              cloudinary.api.delete_folder(
                `users/${userId}/profile`,
                function (err) {
                  if (err) res.status(500).json({ message: err });
                  else {
                    console.log("Dossier bien suprimé");
                    res.status(200).json({
                      message: "Image de profil et dossier bien suprimés",
                    });
                  }
                }
              );
            } else res.status(500).json({ message: err });
          }
        );
      } else {
        if (replaceImage) {
          cloudinary.api.delete_resources_by_prefix(
            `users/${userId}/profile/${elementToDelete}`,
            async function (err) {
              if (!err) {
                console.log("Ancienne image de profil bien remplacée");
                res
                  .status(200)
                  .json({ message: "Ancienne image de profil bien remplacée" });
              } else res.status(500).json({ message: err });
            }
          );
        } else
          res
            .status(200)
            .json({ message: "Nouvelle image de profil bien ajoutée" });
      }
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
    if (password.length < 5) {
      return res.status(400).json({ message: "mot de passe trop court" });
    }
    const cryptedPass = await bcrypt.hash(req.body.password, saltRounds);

    try {
      let user = {
        tel: phone,
        starsNb: 0,
        email: email,
        role: "user",
        reviewsNb: 0,
        superUser: false,
        hash: cryptedPass,
        lastname: lastname,
        firstname: firstname,
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
            superUser: user.superUser,
            firstname: user.firstname,
            favorites: user.favorites,
            adsWithImages: user.adsWithImages,
          };
          const payload = { _id: user._id, email: user.email };
          const token = jwt.sign(payload, secret);
          req.session.user = dataToUse;
          // Session à récuperer dans le header.session côté front
          req.session.isLogged = true;
          res.status(200).json({
            session: req.session,
            token: token,
            message: "Le mot de passe est correct",
          });
        }
      }
    } catch (e) {
      console.log("e", e);
      res.json({ status: 500, message: "Erreur du serveur!" });
    }
  });

  /*---------------------------------------*/
  //route pour se déconnecter
  app.post("/user/logout", async (req, res, next) => {
    /* console.log('le back reçoit la route de logout')
    console.log('REQ.BODY')
    console.log(req.body) */

    /* console.log('REQ.SESSION :')
    console.log(req.session) */
    /* const { id } = req.body
    console.log('id', id) */

    req.session.destroy((err) => {
      if (err) {
        console.log("Echec déconnexion", err);
        //res.json({status: 500, id: req.body.id, message: 'Echec déconnexion', result: err})
      } else {
        res.json({
          _id: req.body.id,
          message: "Session détruite côté backend, déconnexion bien effectuée",
        });
      }
      // res.redirect('/user/login')
    });
  });

  /*---------------------------------------*/

  //route pour afficher les infos du profil
  /* app.get('/profil', async (req, res, next)=>{
      res.render('layout', {template: 'profil', session: req.session})
  }) */

  /*---------------------------------------*/

  //route get de récup de tous les utilisateurs
  /* app.get('/user/all', async (req, res, next)=>{
      //la fonction find de mongoose récup les utilisateurs dans la bdd
      userModel.find({}, ["firstname", "lastname"], (err, User) => {
          if(err){
              res.json({status: 500, result: err})
          }
          //console.log(User)
          res.json({status: 200, result: User})
      })
  }) */

  /*----------------------------*/

  // route get des annonces de l'user

  app.get("/user/:id", async (req, res, next) => {
    console.log("je reçois le get de user id");
    console.log("req.params", req.params);
    const id = req.params.id;
    console.log("id", id);
    //const withLiteInfosOfUser = res.req.query.withLiteInfosOfUser

    // console.log('withLiteInfosOfUser', withLiteInfosOfUser)

    try {
      // on récup le produit par son id
      let user = await userModel.findById(id);
      // si il ne trouve pas de user
      if (!user) {
        // on retourne une erreur
        res.status(400).json(null);
      } else {
        const { imageUser, superUser, starsNb, firstname } = user;
        // On récupère les annonces de l'user
        const adsOfUser = await adModel.find({ userId: id });

        if (adsOfUser.length) {
          const buildCard = async () => {
            const allCardsAds = [];
            for (const ad of adsOfUser) {
              const card = { ...ad._doc, imageUser, superUser, starsNb };
              allCardsAds.push(card);
            }
            return allCardsAds;
          };
          const allCardsAds = await buildCard();
          console.log("allCardsAds", allCardsAds);
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
      console.log("erreur", error);
      res.status(500).json({ message: "Erreur du serveur!" });
      throw error;
    }
  });
};
