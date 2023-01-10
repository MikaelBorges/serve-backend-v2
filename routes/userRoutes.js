// module pour crypter et comparer par un mot de passe
const bcrypt = require('bcrypt'),
      saltRounds = 10



module.exports = (app, db) => {

    const userModel = require('../models/userModel'),
          adModel = require('../models/annoncesModel')

    // route get de register
    app.post('/addToFavorites', async (req, res, next) => {
      const { adId, userId } = req.body
      const user = await userModel.findOne({_id: userId})
      if(!user) {
        res.status(400).json({message: "L'user à l'initiative est introuvable"})
      }
      else {
        // si absent du tableau alors on ajoute :
        const index = user.favorites.indexOf(adId),
              ad = await adModel.findOne({_id: adId})
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

    // route post de register
    app.post('/user/register', async (req, res, next) => {

      console.log('le back reçoit bien la route de register')
      console.log('req.body', req.body)

      const { firstname, lastname, email, password, phone, image } = req.body

      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: 'email vide'})
      }
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ message: 'mot de passe vide'})
      }
      if (password.length < 5) {
        return res.status(400).json({ message: 'mot de passe trop court'})
      }

      // on hash le password
      const cryptedPass = await bcrypt.hash(req.body.password, saltRounds)

      try {
          /* const res = await userModel.create({
            firstname: firstname,
            lastname: lastname,
            email : email,
            hash : cryptedPass,
          })
          console.log('success', res)
          //return res.status(200).json({message: "Votre compte a été créé"}) */

          /*===============================*/

          /* let imageUser = req.body.imageUser
          if(!req.body.imageUser) imageUser = 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png' */
          const imageUser = image ? image : 'https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png'

          // on crée la data (objet) que l'on balancera dans le schema
          let user = {
            firstname: firstname,
            lastname: lastname,
            email: email,
            hash: cryptedPass,
            role: 'user',
            imageUser: imageUser,
            reviewsNb: 0,
            starsNb: 0,
            superUser: false,
            tel: phone
          }
          // on va instancier notre model (schema) avec la data
          const newUser = new userModel(user)
          // on va sauvegarder le model avec .save()
          newUser.save(function(err, doc){
            if(err) {
                console.log('Echec ajout user ', err)
            }
            console.log('Utilisateur bien enregistré')
          })
          res.status(200).json({message: 'Votre compte a bien été créé'})

          /*================================*/

      /* // on check si l'user existe dans la bdd avec son email
      let user = await userModel.findOne({email})
      console.log('user',user)
      // si il n'existe pas
      if(!user) {
          // on hash le password
          const cryptedPass = await bcrypt.hash(req.body.password, saltRounds)
          // on crée la data (objet) que l'on balancera dans le schema
          let user = {
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              email: req.body.email,
              hash: cryptedPass,
              role: 'user',
          }
          // on va instancier notre model (schema) avec la data
          const newUser = new userModel(user)
          // on va sauvegarder le model avec .save()
          newUser.save(function(err, doc){
              if(err) {
                  console.log('Echec ajout user ', err)
              }
              console.log("Utilisateur bien enregistré")
          })
          res.status(200).json({message: "Votre compte a bien été créé"})
      }
      else {
          // si le mail existe deja, on retourne une erreur
          res.status(400).json({message: "Cette addresse email est déjà utilisée"})
      } */
      } catch(error) {
          if (error.code === 11000) {
            console.log('Email déjà utilisé', error)
            return res.status(400).json({message: 'Email déjà utilisé'})
          }
          throw error
      }

      /* try {
          // on check si l'user existe dans la bdd avec son email
          let user = await userModel.findOne({email})
          console.log('user',user)
          // si il n'existe pas
          if(!user) {
              // on crée la data (objet) que l'on balancera dans le schema
              let user = {
                  firstname: req.body.firstname,
                  lastname: req.body.lastname,
                  email: req.body.email,
                  hash: cryptedPass,
                  role: 'user',
              }
              // on va instancier notre model (schema) avec la data
              const newUser = new userModel(user)
              // on va sauvegarder le model avec .save()
              newUser.save(function(err, doc){
                  if(err) {
                      console.log('Echec ajout user ', err)
                  }
                  console.log("Utilisateur bien enregistré")
              })
              res.status(200).json({message: "Votre compte a bien été créé"})
          }
          else {
              // si le mail existe deja, on retourne une erreur
              res.status(400).json({message: "Cette addresse email est déjà utilisée"})
          }
      }
      catch(e) {
          console.log('erreur500')
          res.json({status: 500, message: "Erreur du serveur!"})
      } */

    })
    /*---------------------------------------*/

    // route get de login
    /* app.get('/user/login', async (req, res, next)=>{
        res.render('layout', {template: 'login', name: "Se connecter", session: req.session})
    }) */
    
    
    /*---------------------------------------*/

    //route de login
    /* app.post('/user/login', async (req,  res, next)=>{
        let user = await userModel.getUserByMail(req.body.email);
        if(user.length === 0) {
            res.json({status: 404, msg: "email inexistant dans la base de donnée"})
        } else {
            if(user[0].validate === "no") {
                res.json({status: 403, msg: "Votre compte n'est pas validé"})
            }
            let same = await bcrypt.compare(req.body.password, user[0].password);
            if(same) {
                let infos = {id: user[0].id, email: user[0].email}
                let token = jwt.sign(infos, secret);
                res.json({status: 200, msg: "connecté", token: token, user: user[0]})
            } else {
                res.json({status: 401, msg: "mauvais mot de passe"})
            }
        }
    }) */

    //route post de login
    app.post('/user/login', async (req, res, next) => {

      console.log('le back reçoit la route de login')

      console.log('REQ.SESSION')
      console.log(req.session)

      console.log('REQ.SESSION ID')
      console.log(req.sessionID)

      console.log('EMAIL')
      console.log(req.body.email)

      console.log('PASSWORD')
      console.log(req.body.password)

      //on recup les infos du formulaire
      const { email, password } = req.body
      console.log('email', email)
      console.log('password', password)

      try {
          //on check si l'user existe dans la bdd avec son email
          let user = await userModel.findOne({email})
          //si il n'existe pas
          if(!user) {
              //on retourne une erreur
              res.status(400).json({message: "L'email est introuvable"})
          }
          else {
              //on retourne un succes
              //res.status(200).json({message: "Email trouvé!"})
              console.log('Email trouvé!')
              //on compare les mdp avec bcrypt renvoi true ou false
              const isMatch = await bcrypt.compare(password, user.hash)
              //si ils ne sont pas les mm
              if(!isMatch) {
                  //on retourne une erreur
                  res.status(400).json({message: "Le mot de passe est incorrect"})
              }
              else {
                req.session.user = {
                  _id: user._id,
                  role: user.role,
                  email: user.email,
                  starsNb: user.starsNb,
                  lastname: user.lastname,
                  imageUser: user.imageUser,
                  reviewsNb: user.reviewsNb,
                  superUser: user.superUser,
                  firstname: user.firstname,
                }
                // Session à récuperer dans le header.session côté front
                req.session.isLogged = true
                //res.status(200).json({message: "Le mot de passe est correct"})
                res.status(200).json({session: req.session, message: "Le mot de passe est correct"})
              }
          }
      }
      catch(e) {
        console.log('erreur500')
        res.json({status: 500, message: "Erreur du serveur!"})
      }






    })

    /*---------------------------------------*/
    //route pour se déconnecter
    app.post('/user/logout', async (req, res, next)=>{

      console.log('le back reçoit la route de logout')
      console.log('REQ.BODY')
      console.log(req.body)

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
          res.json({_id: req.body.id, message: 'Déconnexion bien effectuée'})
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

        const id = req.params.id,
              withLiteInfosOfUser = res.req.query.withLiteInfosOfUser

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
                const adsOfUser = await adModel.find({userId: id}),
                      noAds = adsOfUser.length ? false : true
                console.log('noAds', noAds)

                if(withLiteInfosOfUser === 'true') {
                  const userInfos = await userModel.findById(id),
                  liteInfos = {
                    firstname: userInfos.firstname,
                    lastname: userInfos.lastname,
                    imageUser: userInfos.imageUser,
                    superUser: userInfos.superUser,
                    reviewsNb: userInfos.reviewsNb,
                    starsNb: userInfos.starsNb,
                  }

                  res.status(200).json({noAds, adsOfUser, liteInfos})
                } else {
                  res.status(200).json({noAds, adsOfUser})
                }
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
