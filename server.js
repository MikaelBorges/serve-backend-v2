require('dotenv').config()

// IMPORTS :
const cors = require('cors'),
      express = require('express'),
      mongoose = require('mongoose')


// MIDDLEWARE :
const app = express()
//parse les url
//app.use(express.urlencoded({ extended: false }))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())


//ici on recup tout le dossier pubic (css, fonts, img, js)
app.use(express.static(__dirname + '/public'));
//ici on gère l'affichage des templates front
app.set('views', './views');
app.set('view engine', 'ejs');

let session = require('express-session'),
    parseurl = require('parseurl')

//session va gérer la création/vérification du token lors du login
app.use(session({
    secret: 'love kevin',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}))

app.use(function (req, res, next) {
    if (!req.session.user) {
        req.session.user = null
        req.session.isLogged = false
    }

    // get the url pathname   pathname est la section de chemin de l'URL, qui vient après l'hôte et avant la requête
    let pathname = parseurl(req).pathname
    //gestion des routes protégées

    // routes uniquement pour l'admin

    //conditions pour les accés aux routes avec restrictions qui redirigent vers le login si il n'est pas connecté ou admin

    next()
})

const userRoutes = require('./routes/userRoutes');
const annoncesRoutes = require('./routes/annoncesRoutes');



// Configuration de l'objet Promise utilisé par mongoose (ici, ce seront celles dans Node.js -> global.Promise)
mongoose.Promise = global.Promise;

// Adapter en fonction de la configuration sur le compte "Atlas"
// const connectionString = 'mongodb+srv://Mikael:Mborges1984@cluster0.ioylj.mongodb.net/Database?retryWrites=true&w=majority';
const connectionString = 'mongodb://localhost:27017/Database?retryWrites=true&w=majority';
// Connexion à la base mongo :
mongoose
    //.connect(connectionString || connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((db) => {
        // Démarrage du serveur (qui ne démarre QUE si la connexion à la base mongo est bien établie!)
        console.log("CONNECTÉ")

        /* app.get('/', (req, res)=>{
            res.render('layout', {template: "home", name: "Home", session: req.session})
        }) */

        let adModel = require('./models/annoncesModel');
        //route get de tous les produits
            app.get('/', async (req, res, next)=>{
            //récupération de tous les produits ds la bdd
            let ads = await adModel.find()
            //affichage
            //res.render('layout', {template: 'annonces', name: "Annonces", annonces: ads, session: req.session})
            res.json(ads)
        })

        /* app.get('/essai', (req, res) =>{
            res.json({post: "tueur", crimes: 322})
        }) */
        //appel de nos routes
        userRoutes(app, db)
        annoncesRoutes(app, db)

        //app.listen(process.env.PORT || 3306, function() {
        app.listen(3306, function() {
            console.log("Le serveur écoute");
        });
    })
    .catch(err => console.error(err.message));
