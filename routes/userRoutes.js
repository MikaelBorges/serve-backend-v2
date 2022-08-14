//module pour crypter et comparer par un mot de passe
const bcrypt = require('bcrypt'),
      saltRounds = 10



module.exports = (app, db)=>{

    let adModel = require('../models/annoncesModel')

    //route get de toutes les annonces :
    app.get('/', async (req, res, next)=>{
      // console.log('REQ')
      // console.log(req)
      // console.log('REQ.SESSION')
      // console.log(req.session)
      let ads = await adModel.find()
      // affichage
      // res.render('layout', {template: 'annonces', name: "Annonces", annonces: ads, session: req.session})
      res.json(ads)
    })


    /*---------------------------------------*/


    let userModel = require('../models/userModel');

    //route get de register
    app.get('/user/register', async (req, res, next)=>{
        res.render('layout', {template: 'register', name: "S'enregistrer", session: req.session})
    })
    
    
    /*---------------------------------------*/
    
    //route post de register
    app.post('/user/register', async (req, res, next)=>{
        //(en option vous pouvez checker si l'email existe pour refusé si il y'a déjà)
        //on hash le password
        let cryptedPass = await bcrypt.hash(req.body.password, saltRounds)
        //on crée la data (objet) que l'on balancera dans le schema
        let user = {
            firstname: req.body.firstName,
            lastname: req.body.lastName,
            email: req.body.email,
            hash: cryptedPass,
            role: "user"
        }
        //on va instancier notre model (schema) avec la data
        let newUser = new userModel(user)
        //on va sauvegarder le model avec .save()
        newUser.save(function(err, doc){
            if(err){
                console.log('Echec ajout user ', err)
            }
            console.log("Utilisateur bien enregistré")
        })
        
        //redirection vers l'accueil
        res.redirect('/user/login')
    })
    /*---------------------------------------*/
    
    //route get de login
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
    app.post('/user/login', async (req, res, next)=>{

      console.log('le back reçoit la route de login')

      console.log('REQ.SESSION')
      console.log(req.session)

      console.log('REQ.SESSION ID')
      console.log(req.sessionID)

      //console.log('EMAIL')
      console.log('EMAIL PASSWORD', req.body.email, req.body.password)

      //on recup les infos du formulaire
      //const {email, password} = req.body
      //const email = req.body.email
      //const password = req.body.password

      let email = ''
      if (req.body.email === '') {
        email = 'cf@gmail.com'
      }
      else {
        email = req.body.email
      }

      //if (req.body.email) {
        console.log('email renseigné')
        if (req.session.isLogged) {
          console.log('deja loggué, le back renvoie les infos de la session en json')
          res.json(req.session)
        }
        else {
          console.log('pas encore loggué')
          if (req.body.password === '') {``
            console.log('mot de passe ok')
            req.session.isLogged = true
            req.session.user = {
              email: email,
              password: req.body.password,
              sessionID: req.sessionID,
              isLogged: true,
            }
            console.log('loggué')
            console.log('REQ.SESSION')
            console.log(req.session)
            res.json(req.session)
          }
          else {
            req.json({
              status: 403,
              msg: 'Mauvais email ou mot de passe'
            })
          }
        }
      //}

      /* try {

          //console.log('try')

          //on check si l'user existe dans la bdd avec son email
          let user = await userModel.findOne({email})

          //si il n'existe pas
          if(!user){
              console.log('user not found')
              //on retourne une erreur
              res.status(400).json({message: "Email introuvable!"})
          }
          //on compare les mdp avec bcrypt renvoi true ou false
          const isMatch = await bcrypt.compare(password, user.hash)
          //console.log('isMatch', isMatch)
          //si ils ne sont pas les mm
          if(!isMatch){
              console.log('error on password')
              //on retourne une erreur
              res.json({status: 400, message: "Mot de passe incorrect!"})
          }
          //création de la session utilisateur
          req.session.user = {
              id: user._id,
              firstname: user.firstname,
              lastname: user.lastname,
              email: user.email,
              role: user.role
          }

          //req.session.status = 200
          req.session.isLogged = true
          //console.log('req.session :')
          //console.log(req.session)
          res.json(req.session)
      }catch(e){
        console.log('erreur500')
        res.json({status: 500, message: "Erreur du serveur!"})
      } */
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
          res.json({id: req.body.id, message: 'Déconnexion bien effectuée'})
        }
        // res.redirect('/user/login')
      })
      
    })

    /*---------------------------------------*/
    
    //route pour afficher les infos du profil
    app.get('/profil', async (req, res, next)=>{
        res.render('layout', {template: 'profil', session: req.session})
    })
    
    /*---------------------------------------*/
    
    //route get de récup de tous les utilisateurs
    app.get('/user/all', async (req, res, next)=>{
        //la fonction find de mongoose récup les utilisateurs dans la bdd
        userModel.find({}, ["firstname", "lastname"], (err, User) =>{
            if(err){
                res.json({status: 500, result: err})
            }
            //console.log(User)
            res.json({status: 200, result: User})
        })
    })
}
