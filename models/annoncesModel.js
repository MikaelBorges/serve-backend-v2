//création d'un model dont le schéma possèdera les propriété name, description, price + ce que vous voulez
const mongoose = require('mongoose')

// Définition du "Schéma" d'un produit
const AnnoncesSchema = mongoose.Schema({
    name : { type: String },
    description: { type: String},
    price: { type: String },
});

// Export du ModÃ¨le mongoose reprÃ©sentant un objet User
module.exports = mongoose.model('Annonces', AnnoncesSchema);