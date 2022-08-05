//module pour crypter et comparer par un mot de passe
const bcrypt = require('bcrypt');
const saltRounds = 10;



module.exports = (app, db)=>{
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
    app.get('/user/login', async (req, res, next)=>{
        res.render('layout', {template: 'login', name: "Se connecter", session: req.session})
    })
    
    
    /*---------------------------------------*/
    
    //route post de login
    app.post('/user/login', async (req, res, next)=>{
        //on recup les infos du formulaire
        const {email, password} = req.body
        /*
            const email = req.body.email
            const password = req.body.password
        */
        try {
            //on check si l'user existe dans la bdd avec son email
            let user = await userModel.findOne({email})
            //si il n'existe pas
            if(!user){
                //on retourne une erreur
                res.status(400).json({message: "Email introuvable!"})
            }    
            //on compare les mdp avec bcrypt renvoi true ou false
            const isMatch = await bcrypt.compare(password, user.hash)
            //si ils ne sont pas les mm
            if(!isMatch){
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
            
            req.session.isLogged = true
                
            res.redirect('/')
        }catch(e){
            res.json({status: 500, message: "Erreur du serveur!"})
        }
        
    })
    
    /*---------------------------------------*/
    //route pour se déconnecter
    app.get('/user/logout', async (req, res, next)=>{
       req.session.destroy((err)=>{
            if(err){
                console.log("Echec déconnexion", err)
            }
            res.redirect('/user/login')
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
            console.log(User)
            res.json({status: 200, result: User})
        })
    })
}
