//création d'un model dont le schéma possèdera les propriété title, description, price + ce que vous voulez
const mongoose = require("mongoose");

// Définition du "Schéma" d'un produit
const AnnoncesSchema = mongoose.Schema({
  title: { type: String },
  description: { type: String },
  price: { type: String },
  userId: { type: String },
  favoritesNb: { type: Number },
  location: { type: String },
  dateOfPublication: { type: String },
  timeOfPublication: { type: String },
  views: { type: Number },
  imagesWork: { type: Array },
});

// Export du Modèle mongoose représentant un objet User
module.exports = mongoose.model("Annonces", AnnoncesSchema);
