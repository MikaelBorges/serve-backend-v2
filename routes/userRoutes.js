// module pour crypter et comparer par un mot de passe
const saltRounds = 10
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const secret = process.env.TOKEN_SECRET
const withAuth = require('../withAuth')

const cloudinary = require('../utils/cloudinary')

module.exports = (app, db) => {

  const userModel = require('../models/userModel')
  const adModel = require('../models/annoncesModel')

  // route post d'une annonce favorite
  app.post('/addToFavorites', withAuth, async (req, res, next) => {
    if(req._id) console.log('id issu du token', req._id)
    //console.log('req.body', req.body)
    const adId = req.body.adId
    console.log('adId', adId)
    const userId = req._id
    const user = await userModel.findOne({_id: userId})
    if(!user) {
      res.status(400).json({message: "L'user à l'initiative est introuvable"})
    }
    else {
      // si absent du tableau alors on ajoute :
      const index = user.favorites.indexOf(adId)
      const ad = await adModel.findOne({_id: adId})
      if (index === -1) {
        console.log('ajout')
        await userModel.updateOne(
          { _id: userId },
          { $push: { favorites: adId } }
        )
        const favNb = ++ad.favoritesNb
        await adModel.updateOne(
          { _id: adId },
          { favoritesNb: favNb }
        )
        res.status(200).json({newFavNumber: favNb, message: 'Annonce bien ajoutée aux favoris'})
      }
      else {
        console.log('suppression')
        await userModel.updateOne(
          { _id: userId },
          { $pull: { favorites: adId } }
        )
        const favNb = --ad.favoritesNb
        await adModel.updateOne(
          { _id: adId },
          { favoritesNb: favNb }
        )
        res.status(200).json({newFavNumber: favNb, message: 'Annonce bien supprimée des favoris'})
      }
    }
  })

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

  app.post('/user/registerUserImage', async (req, res, next) => {
    const { userIdCreated, urlUserImage } = req.body
    await userModel.updateOne(
      { _id: userIdCreated },
      { imageUser: urlUserImage }
    )
    res.status(200).json({message: 'Photo de profil bien enregistrée'})
  })

  app.post('/user/changeUserData/:id', async (req, res, next) => {
    const userId = req.params.id
    const { firstname, lastname, email, password, phone } = req.body
    console.log('userId', userId)
    console.log('req.body', req.body)
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'email vide'})
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'mot de passe vide'})
    }
    if (password.length < 5) {
      return res.status(400).json({ message: 'mot de passe trop court'})
    }
    const cryptedPass = await bcrypt.hash(req.body.password, saltRounds)
    try {
      await userModel.updateOne(
        { _id: userId },
        {
          tel: phone,
          email: email,
          hash: cryptedPass,
          lastname: lastname,
          firstname: firstname
        }
      )
      res.status(200).json({message: 'Votre compte a bien été modifié'})
    }
    catch(error) {
      if (error.code === 11000) return res.status(400).json({message: 'Email déjà utilisé'})
      throw error
    }
  })

  app.post('/user/register', async (req, res, next) => {
    const { firstname, lastname, email, password, phone } = req.body
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ message: 'email vide'})
    }
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ message: 'mot de passe vide'})
    }
    if (password.length < 5) {
      return res.status(400).json({ message: 'mot de passe trop court'})
    }
    const cryptedPass = await bcrypt.hash(req.body.password, saltRounds)

    try {
      let user = {
        tel: phone,
        starsNb: 0,
        email: email,
        role: 'user',
        reviewsNb: 0,
        superUser: false,
        hash: cryptedPass,
        lastname: lastname,
        firstname: firstname
      }
      const newUser = new userModel(user)
      newUser.save(function(err, doc) {
        if(err) res.status(500).json({message: 'Echec ajout user'})
        const userId = doc._id.toString()
        res.status(200).json({message: 'Votre compte a bien été créé', userIdCreated: userId})
      })
    }
    catch(error) {
      if (error.code === 11000) return res.status(400).json({message: 'Email déjà utilisé'})
      throw error
    }
  })

  app.post('/user/login', async (req, res, next) => {
    const { email, password } = req.body
    try {
        let user = await userModel.findOne({email})
        if(!user) res.status(400).json({message: "L'email est introuvable"})
        else {
          const isMatch = await bcrypt.compare(password, user.hash)
          if(!isMatch) res.status(400).json({message: "Le mot de passe est incorrect"})
          else {
            const dataToUse = {
              _id: user._id,
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
              adsWithImages: user.adsWithImages
            }
            const payload = { _id: user._id, email: user.email }
            const token = jwt.sign(payload, secret)
            req.session.user = dataToUse
            // Session à récuperer dans le header.session côté front
            req.session.isLogged = true
            res.status(200).json({session: req.session, token: token, message: "Le mot de passe est correct"})
          }
        }
    }
    catch(e) {
      res.json({status: 500, message: "Erreur du serveur!"})
    }






  })

  /*---------------------------------------*/
  //route pour se déconnecter
  app.post('/user/logout', async (req, res, next)=>{

    /* console.log('le back reçoit la route de logout')
    console.log('REQ.BODY')
    console.log(req.body) */

    /* console.log('REQ.SESSION :')
    console.log(req.session) */
    /* const { id } = req.body
    console.log('id', id) */

    req.session.destroy((err)=>{
      if(err){
          console.log("Echec déconnexion", err)
          //res.json({status: 500, id: req.body.id, message: 'Echec déconnexion', result: err})
      }
      else {
        res.json({_id: req.body.id, message: 'Session détruite côté backend, déconnexion bien effectuée'})
      }
      // res.redirect('/user/login')
    })
    
  })

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

  app.get('/user/:id', async (req, res, next) => {

      const id = req.params.id
      //const withLiteInfosOfUser = res.req.query.withLiteInfosOfUser

      // console.log('withLiteInfosOfUser', withLiteInfosOfUser)

      try {
          // on récup le produit par son id
          let user = await userModel.findById(id)
          //console.log('user', user)
          // si il ne trouve pas de user
          if(!user) {
            // on retourne une erreur
            res.status(400).json({message: "User Not Exist"})
          }
          else {
            // On récupère les annonces de l'user
            const adsOfUser = await adModel.find({userId: id})
            const noAds = adsOfUser.length ? false : true
            const userInfos = await userModel.findById(id)
            const liteInfos = {
              starsNb: userInfos.starsNb,
              lastname: userInfos.lastname,
              firstname: userInfos.firstname,
              imageUser: userInfos.imageUser,
              superUser: userInfos.superUser,
              reviewsNb: userInfos.reviewsNb
            }

            res.status(200).json({adsOfUser, liteInfos, noAds})

            /* if(withLiteInfosOfUser === 'true') {
              const userInfos = await userModel.findById(id),
              liteInfos = {
                starsNb: userInfos.starsNb,
                lastname: userInfos.lastname,
                firstname: userInfos.firstname,
                imageUser: userInfos.imageUser,
                superUser: userInfos.superUser,
                reviewsNb: userInfos.reviewsNb
              }
              res.status(200).json({noAds, adsOfUser, liteInfos})
            }
            else {
              res.status(200).json({noAds, adsOfUser})
            } */
          }

          /* req.session.user = {
            id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            role: user.role,
          }
          req.session.isLogged = true
          res.status(200).json({session: req.session, message: "Le mot de passe est correct"}) */
      }
      catch(error) {
        console.log('erreur', error)
        /*return*/ res.status(500).json({message: "Erreur du serveur!"})
        throw error
      }

      /* catch(e) {
        console.log('erreur500')
        res.json({status: 500, message: "Erreur du serveur!"})
      } */

      /* catch(error) {
          if (error.code === 11000) {
            console.log('Email déjà utilisé', error)
            return res.status(400).json({message: "Email déjà utilisé"})
          }
          throw error
      } */


  })


}
