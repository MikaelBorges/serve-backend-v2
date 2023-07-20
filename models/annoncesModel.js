const mongoose = require("mongoose");

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

module.exports = mongoose.model("Annonces", AnnoncesSchema);
