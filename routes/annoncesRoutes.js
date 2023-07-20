const userModel = require("../models/userModel");
const adModel = require("../models/annoncesModel");

module.exports = (app, db) => {
  app.get("/", async (req, res, next) => {
    const ads = await adModel.find();
    const buildCard = async () => {
      const allCardsAds = [];
      for (const ad of ads) {
        const { userId } = ad;
        const user = await userModel.findById(userId);
        // Note > obligé de mettre ce if car un user peut etre nul et ses ads peuvent être encore présentes
        // Note > c'est juste le temps que je gère la suppresion des ads après la suppression d'un user
        if (user) {
          const { imageUser, levelUser, starsNb, initials } = user;
          const card = { ...ad._doc, imageUser, levelUser, starsNb, initials };
          allCardsAds.push(card);
        }
      }
      return allCardsAds;
    };
    const allCardsAds = await buildCard();
    res.json({ allAds: allCardsAds, status: 200 });
  });

  app.post("/user/ad/:userId", async (req, res, next) => {
    const year = new Date().getFullYear();
    const { title, description, price, location } = req.body;
    const { userId } = req.params;

    let day = new Date().getDate(),
      hours = new Date().getHours(),
      month = new Date().getMonth() + 1,
      minutes = new Date().getMinutes();

    if (minutes < 10) minutes = `0${minutes}`;
    if (hours < 10) hours = `0${hours}`;
    if (day < 10) day = `0${day}`;
    if (month < 10) month = `0${month}`;

    const timeOfPublication = `${hours}:${minutes}`,
      dateOfPublication = `${day}/${month}/${year}`,
      newAd = {
        title,
        description,
        price,
        userId,
        favoritesNb: 0,
        views: 0,
        location,
        dateOfPublication,
        timeOfPublication,
      };

    const annonce = new adModel(newAd);
    annonce.save(async function (err, doc) {
      if (err)
        res
          .status(500)
          .json({ message: "Erreur dans l'envoi de votre annonce" });
      else {
        const adId = doc._id.toString();
        await userModel.updateOne({ _id: userId }, { $push: { ads: adId } });
        res.status(200).json({
          message: "Votre annonce a bien été envoyée",
          adIdCreated: adId,
        });
      }
    });
  });

  app.post("/modifyAd/:adId", async (req, res, next) => {
    const { title, price, location, description } = req.body;
    const { adId } = req.params;
    const ad = await adModel.findById(adId);
    if (ad) {
      await adModel.updateOne(
        { _id: adId },
        {
          title: title,
          price: price,
          location: location,
          description: description,
        }
      );
      res.json({ message: "Annonce bien modifiée" });
    } else {
      res.status(500).json({ message: "Annonce introuvable" });
    }
  });

  app.delete("/deleteAd", async (req, res, next) => {
    const { adId, userId } = req.body;
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
        res.json({ message: "Votre annonce a bien été suprimée" });
      }
    });
  });

  app.get("/retrieveAd/:id", async (req, res, next) => {
    const id = req.params.id;
    try {
      const ad = await adModel.findById(id);
      if (ad) {
        const { userId } = ad;
        const user = await userModel.findById(userId);
        const { imageUser, levelUser, starsNb, phone, firstname, initials } =
          user;
        const userInfo = {
          imageUser,
          levelUser,
          starsNb,
          phone,
          firstname,
          initials,
        };

        res.json({ ad: ad, user: userInfo, status: 200 });
      } else res.status(400).json(null);
    } catch (error) {
      res.status(500).json({ message: "Erreur du serveur!" });
      throw error;
    }
  });
};
