//création d'un model dont le schéma possèdera les propriété title, description, price + ce que vous voulez
const mongoose = require('mongoose')

// Définition du "Schéma" d'un produit
const AnnoncesSchema = mongoose.Schema({
    title: { type: String },
    description: { type: String},
    price: { type: String },
    userId: { type: String },
    firstname: { type: String },
    lastname: { type: String },
    superUser: { type: Boolean },
    reviewsNb: { type: Number },
    starsNb: { type: Number },
    favoritesNb: { type: Number },
    imageUser: { type: String },
    imageWork: { type: String },
    location: { type: String },
    dateOfPublication: { type: String },
    timeOfPublication: { type: String },
    views: { type: Number },
});

// Export du Modèle mongoose représentant un objet User
module.exports = mongoose.model('Annonces', AnnoncesSchema)
