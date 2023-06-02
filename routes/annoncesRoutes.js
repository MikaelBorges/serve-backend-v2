/* const { format } = require('express/lib/response') */
const userModel = require("../models/userModel");
const adModel = require("../models/annoncesModel");

const cloudinary = require("../utils/cloudinary");

module.exports = (app, db) => {
  // route get des annonces
  app.get("/", async (req, res, next) => {
    const ads = await adModel.find();
    const buildCard = async () => {
      const allCardsAds = [];
      for (const ad of ads) {
        const { userId } = ad;
        const user = await userModel.findById(userId);
        const { imageUser, superUser, starsNb } = user;
        const card = { ...ad._doc, imageUser, superUser, starsNb };
        allCardsAds.push(card);
      }
      return allCardsAds;
    };
    const allCardsAds = await buildCard();
    res.json({ allAds: allCardsAds, status: 200 });
  });

  /*---------------------------------------*/

  //une route post pour les nouvelles annonces
  app.post("/user/ad/:id", async (req, res, next) => {
    const year = new Date().getFullYear();
    const {
      tel,
      userId,
      title,
      description,
      price,
      location,
      firstname,
      lastname,
      superUser,
      reviewsNb,
      starsNb,
      imageUser,
      adHaveImages,
    } = req.body;

    let day = new Date().getDate(),
      hours = new Date().getHours(),
      month = new Date().getMonth() + 1,
      minutes = new Date().getMinutes();

    if (minutes < 10) minutes = `0${minutes}`;
    if (hours < 10) hours = `0${hours}`;
    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;

    const time = `${hours}:${minutes}`,
      date = `${day}/${month}/${year}`,
      // on crée l'objet du produit
      newAd = {
        tel: tel,
        title: title,
        description: description,
        price: price,
        userId: userId,
        firstname: firstname,
        lastname: lastname,
        superUser: superUser,
        reviewsNb: reviewsNb,
        starsNb: starsNb,
        favoritesNb: 0,
        views: 0,
        imageUser: imageUser,
        location: location,
        dateOfPublication: date,
        timeOfPublication: time,
      };

    // on va instancier notre model (schema) avec l'objet
    const annonce = new adModel(newAd);
    annonce.save(async function (err, doc) {
      if (err)
        res
          .status(500)
          .json({ message: "Erreur dans l'envoi de votre annonce" });
      else {
        const adId = doc._id.toString();
        const user = await userModel.findOne({ _id: userId });
        await userModel.updateOne({ _id: userId }, { $push: { ads: adId } });
        if (adHaveImages) {
          const adsWithImagesRetrieved = user.adsWithImages
            ? user.adsWithImages
            : 0;
          const adsWithImages = adHaveImages
            ? adsWithImagesRetrieved + 1
            : adsWithImagesRetrieved;
          await userModel.updateOne(
            { _id: userId },
            { adsWithImages: adsWithImages }
          );
        }
        res.status(200).json({
          message: "Votre annonce a bien été envoyée",
          adIdCreated: adId,
        });
      }
    });
  });

  /*----------------------------------------------------*/

  app.post("/testRoute", async (req, res, next) => {
    /* const { imagesWork } = req.body
      console.log('imagesWork', imagesWork)

      const myArray = imagesWork[0].split("/")
      console.log('myArray', myArray)
      const lastElement = myArray[myArray.length - 1]
      console.log('lastElement', lastElement)
      const fileArray = lastElement.split(".")

      console.log('fileArray[0]', fileArray[0]) */

    /* cloudinary.api.delete_resources_by_prefix(`users/${userId}/ads/${adId}`, async function(err) {
        if(err) res.status(500).json({message: err})
        else res.status(200).json({message: 'Images bien suprimées'})
      }) */
    cloudinary.api
      .delete_resources_by_prefix(
        "users/62fc16903edbb27f94be99cf/ads/63df81cc7921fa18073b4004/isenaflseqrg50j6xo1a"
      )
      .then((result) => console.log(result));
  });

  app.post("/modifyAd", async (req, res, next) => {
    const {
      adId,
      title,
      price,
      userId,
      location,
      description,
      urlsAdImages,
      adHaveImages,
      compareIfSomeImagesMustBeDeleted,
    } = req.body;

    const imagesWork = urlsAdImages.length ? urlsAdImages : [];
    console.log("IMAGES WORK", imagesWork);

    const ad = await adModel.findOne({ _id: adId });
    const adHadImages = ad.imagesWork.length ? true : false;
    console.log("AD HAD IMAGES", adHadImages);

    if (compareIfSomeImagesMustBeDeleted) {
      const imagesWorkDb = ad.imagesWork;
      console.log("COMPARER");
      imagesWorkDb.forEach((imageWorkDb) => {
        const index = imagesWork.indexOf(imageWorkDb);
        if (index === -1) {
          const tempArray = imageWorkDb.split("/");
          const lastElement = tempArray[tempArray.length - 1];
          const file = lastElement.split(".");
          const elementToDelete = file[0];
          console.log("IMAGE A SUPPRIMER", elementToDelete);

          cloudinary.api.delete_resources_by_prefix(
            `users/${userId}/ads/${adId}/${elementToDelete}`,
            async function (err) {
              if (err) res.status(500).json({ message: err });
            }
          );
        }
      });
    } else console.log("NE PAS COMPARER");

    await adModel.updateOne(
      { _id: adId },
      {
        title: title,
        price: price,
        location: location,
        imagesWork: imagesWork,
        description: description,
      }
    );

    console.log("AD HAVE IMAGES", adHaveImages);

    if (adHaveImages !== adHadImages) {
      const user = await userModel.findOne({ _id: userId });
      let adsWithImages = 0;
      const adsWithImagesRetrieved = user.adsWithImages
        ? user.adsWithImages
        : 0;
      console.log("ADS WITH IMAGES RETRIEVED", adsWithImagesRetrieved);
      if (adHaveImages) {
        adsWithImages = adsWithImagesRetrieved + 1;
      } else {
        adsWithImages = adsWithImagesRetrieved - 1;
      }

      console.log("ADS WITH IMAGES", adsWithImages);
      await userModel.updateOne(
        { _id: userId },
        { adsWithImages: adsWithImages }
      );
    }

    res.status(200).json({ message: "Annonce bien modifiée" });
  });

  /*---------------------------------------*/

  //une get route edit d'un produit (attention: bien prendre l'id)
  /* app.get('/editProd/:id', async (req, res, next) => {
        let id = req.params.id
        try {
          // on récup le produit par son id
          let ad = await adModel.findById(id)
          // si il ne trouve pas de produit
          if(!ad) {
            // on retourne une erreur
            res.status(400).json({message: "Ad Not Exist"})
          }
          //on affiche le template du formulaire
          res.render('layout', {template: "editProd", name: "Modification Annonce", annonce: ad, session: req.session})
        } catch(e) {
          res.status(500).json({
            message: "Server Error"
          })
        }
    }) */

  app.post("/user/registerAdImages", async (req, res, next) => {
    const { adIdCreated, urlsAdImages } = req.body;
    await adModel.updateOne({ _id: adIdCreated }, { imagesWork: urlsAdImages });
    res.status(200).json({ message: "Photos de l'annonce bien enregistrées" });
  });

  /*---------------------------------------*/

  //route post editProd
  /* app.post('/editProd/:id', async (req, res, next) => {
        let id = req.params.id;
        // on appel une fonction de modification d'un produits (par son id) en lui envoyant un nouvel objet
        await adModel.updateOne({ _id: id }, {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price
        })

        // on redirige vers l'admin
        res.redirect('/admin')
    }) */

  /*---------------------------------------*/

  app.post("/deleteCloudinaryImages", async (req, res, next) => {
    const { adId, userId, checkEmptyFolder } = req.body;
    console.log("userId", userId);
    console.log("adId", adId);
    cloudinary.api.delete_resources_by_prefix(
      `users/${userId}/ads/${adId}`,
      async function (err) {
        if (!err) {
          if (checkEmptyFolder) {
            const user = await userModel.findOne({ _id: userId });
            let path = `users/${userId}/ads/${adId}`;
            if (user.adsWithImages === 1) path = `users/${userId}/ads`;
            cloudinary.api.delete_folder(path, function (err) {
              if (err) res.status(500).json({ message: err });
              else {
                console.log("Images bien suprimées");
                res.status(200).json({ message: "Images bien suprimées" });
              }
            });
          } else {
            console.log("Images bien suprimées");
            res.status(200).json({ message: "Images bien suprimées" });
          }
        } else
          res
            .status(500)
            .json({ message: "Problème dans la suppression des images" });
      }
    );
  });

  //une route de suppression d'un produit (attention: bien prendre l'id)
  app.post("/deleteAd", async (req, res, next) => {
    const { adId, userId, adHaveImages } = req.body;

    //on appel une fonction de suppression d'un produit (par son id)
    adModel.findByIdAndDelete(adId, async function (err) {
      if (err)
        res
          .status(500)
          .json({ message: "Erreur dans la suppression de l'annonce" });
      else {
        await userModel.updateMany(
          { favorites: { $in: [adId] } },
          { $pull: { favorites: adId } }
        );
        await userModel.updateOne({ _id: userId }, { $pull: { ads: adId } });
        if (adHaveImages) {
          const user = await userModel.findOne({ _id: userId });
          cloudinary.api.delete_resources_by_prefix(
            `users/${userId}/ads/${adId}`,
            async function (err) {
              if (!err) {
                let path = `users/${userId}/ads/${adId}`;
                if (user.adsWithImages === 1) path = `users/${userId}/ads`;
                cloudinary.api.delete_folder(path, function (err) {
                  if (err) console.log("err", err);
                });
              } else console.log("err", err);
            }
          );
          const adsWithImagesRetrieved = user.adsWithImages
            ? user.adsWithImages
            : 0;
          if (adsWithImagesRetrieved) {
            const adsWithImages = adHaveImages
              ? adsWithImagesRetrieved - 1
              : adsWithImagesRetrieved;
            await userModel.updateOne(
              { _id: userId },
              { adsWithImages: adsWithImages }
            );
          }
        }
        res.status(200).json({ message: "Votre annonce a bien été suprimée" });
      }
    });
  });

  /* app.get('/deleteProd/:id', async (req, res, next) =>{
      let id = req.params.id;
      //on appel une fonction de suppression d'un produit (par son id)
      await adModel.findByIdAndDelete(id, function (err) {
        if(err) console.log(err);
        console.log("Successful deletion");
      });
      
      //on redirige vers l'admin
      res.redirect('/admin');
    }) */

  app.get("/retrieveAd/:id", async (req, res, next) => {
    const id = req.params.id;
    console.log("ID", id);
    try {
      const ad = await adModel.findById(id);
      if (ad) {
        const { userId } = ad;
        const user = await userModel.findById(userId);

        const { imageUser, superUser, starsNb, phone, firstname } = user;
        const userInfo = {
          imageUser,
          superUser,
          starsNb,
          phone,
          firstname,
        };

        res.status(200).json({ ad: ad, user: userInfo, status: 200 });
      } else res.status(400).json(null);
    } catch (error) {
      res.status(500).json({ message: "Erreur du serveur!" });
      throw error;
    }
  });

  /*---------------------------------------*/

  //route pour la page admin
  /* app.get('/admin', async (req, res, next) => {
        //on récup tous les produits
        let ads = await adModel.find()
        //si il y'a une erreur
        if(!ads) {
            //on retourne la page d'admin avec un tableau vide pour les produits
            res.render('layout', {template: 'admin', annonces: [], name: 'Administration', session: req.session})
        }
        //on affiche le template d'admin avec les produits
        res.render('layout', {template: 'admin', annonces: ads, name: 'Administration', session: req.session})
    }) */
};
