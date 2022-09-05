/* const { format } = require('express/lib/response') */
const userModel = require('../models/userModel'),
      adModel = require('../models/annoncesModel')

module.exports = (app, db) => {

    // route get des annonces
    app.get('/', async (req, res, next) => {
        const ads = await adModel.find(),
              users = await userModel.find()
        res.json({ads, users})
    })

    /*---------------------------------------*/

    //une route post pour les nouvelles annonces
    app.post('/user/ad/:id', async (req, res, next) => {

        const year = new Date().getFullYear(),
              { title, description, price, imageAd, location } = req.body,
              imageWork = imageAd ? imageAd : 'https://travauxcasa.com/public/artiza/images/default.png'

        let day = new Date().getDate(),
            hours = new Date().getHours(),
            month = new Date().getMonth() + 1,
            minutes = new Date().getMinutes()

        if(minutes < 10) minutes = `0${minutes}`
        if(hours < 10) hours = `0${hours}`
        if(day < 10) day = `0${day}`
        if(month < 10) month = `0${month}`

        const time = `${hours}:${minutes}`,
              date = `${day}/${month}/${year}`,

              // on crée l'objet du produit
              newAd = {
                title: title,
                description: description,
                price: price + ' €',
                userId: req.params.id,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                superUser: req.body.superUser,
                reviewsNb: req.body.reviewsNb,
                starsNb: req.body.starsNb,
                favoritesNb: 0,
                views: 0,
                imageUser: req.body.imageUser,
                imageWork: imageWork,
                location: location,
                dateOfPublication: date,
                timeOfPublication: time,
              }

        // on va instancier notre model (schema) avec l'objet
        const annonce = new adModel(newAd)
        annonce.save(function(err, doc) {
          if(err) {
            console.log("Echec ajout annonce", err)
            res.status(500).json({message: "Erreur dans l'envoi de votre annonce"})
          } else {
            console.log("Nouvelle annonce bien ajoutée")
            res.status(200).json({message: 'Votre annonce a bien été envoyée'})
          }
        })
    })

    /*---------------------------------------*/

    //une get route edit d'un produit (attention: bien prendre l'id)
    app.get('/editProd/:id', async (req, res, next) => {
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
        
        
    })

    /*---------------------------------------*/

    //route post editProd
    app.post('/editProd/:id', async (req, res, next) =>{
        let id = req.params.id;
        // on appel une fonction de modification d'un produits (par son id) en lui envoyant un nouvel objet
        await adModel.updateOne({ _id: id }, {
          name: req.body.name,
          description: req.body.description,
          price: req.body.price
        })

        // on redirige vers l'admin
        res.redirect('/admin')
    })

    /*---------------------------------------*/

    /* app.post('/deleteAd', async (req, res, next) => {
      console.log('POST DELETE OK')
    }) */

    //une route de suppression d'un produit (attention: bien prendre l'id)
    app.post('/deleteAd', async (req, res, next) => {
      const id = req.body.id
      console.log('id annonce', id)

      //on appel une fonction de suppression d'un produit (par son id)
      adModel.findByIdAndDelete(id, function (err) {
        if(err) {
          console.log('Echec suppresion annonce', err)
          res.status(500).json({message: "Erreur dans la suppression de l'annonce"})
        } else {
          console.log('Annonce bien supprimée')
          res.status(200).json({message: 'Votre annonce a bien été suprimée'})
        }
      })
    })
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

     /*---------------------------------------*/

    //route pour la page admin
    app.get('/admin', async (req, res, next)=>{
        //on récup tous les produits
        let ads = await adModel.find()
        //si il y'a une erreur
        if(!ads){
            //on retourne la page d'admin avec un tableau vide pour les produits
            res.render('layout', {template: 'admin', annonces: [],name: 'Administration', session: req.session})
        }
        //on affiche le template d'admin avec les produits
        res.render('layout', {template: 'admin', annonces: ads, name: 'Administration', session: req.session})
    })
}