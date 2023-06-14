// Utilisation du module npm 'mongoose'
const mongoose = require("mongoose");

// Définition du "Schéma" d'un utilisateur
const UserSchema = mongoose.Schema(
  {
    firstname: { type: String },
    lastname: { type: String },
    // Validateur personnalisé qui vérifie le format d'une adresse e-mail.
    // Basé sur la documentation de mongoose : http://mongoosejs.com/docs/validation.html#custom-validators
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (mailValue) {
          // c.f. http://emailregex.com/
          const emailRegExp =
            /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
          return emailRegExp.test(mailValue);
        },
        message: "L'adresse email {VALUE} n'est pas une adresse RFC valide.",
      },
    },
    hash: { type: String, required: true },
    role: { type: String },
    phone: { type: String },
    levelUser: { type: String },
    reviewsNb: { type: Number },
    starsNb: { type: Number },
    imageUser: { type: String },
    favorites: { type: Array },
    adsWithImages: { type: Number },
    ads: { type: Array },
  },
  { collection: "users" }
);

// Export du Modèle mongoose représentant un objet User
module.exports = mongoose.model("Users", UserSchema);
