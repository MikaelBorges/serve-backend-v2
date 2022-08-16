// module pour crypter et comparer par un mot de passe
const bcrypt = require('bcrypt'),
      saltRounds = 10



module.exports = (app, db)=>{


    const userModel = require('../models/userModel')

    // route get de register
    /* app.get('/user/register', async (req, res, next) => {
        res.render('layout', {template: 'register', name: "S'enregistrer", session: req.session})
    }) */

    /*---------------------------------------*/

    // route post de register
    app.post('/user/register', async (req, res, next) => {

      console.log('le back reçoit bien la route de register')
      console.log('req.body', req.body)

      const { firstname, lastname, email, password } = req.body

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
            return res.status(400).json({message: "Email déjà utilisé"})
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
                  id: user._id,
                  firstname: user.firstname,
                  lastname: user.lastname,
                  email: user.email,
                  role: user.role,
                }
                req.session.isLogged = true
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
