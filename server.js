require('dotenv').config()

// IMPORTS :
const cors = require('cors'),
      express = require('express'),
      mongoose = require('mongoose')/*,
      bodyParser = require('body-parser')*/


// MIDDLEWARE :
const app = express()
//parse les url
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
//app.use(cors({origin: '*'}))

/* app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json()) */

//ici on recup tout le dossier pubic (css, fonts, img, js)
/* app.use(express.static(__dirname + '/public'));
//ici on gère l'affichage des templates front
app.set('views', './views');
app.set('view engine', 'ejs'); */


// SESSION :
let session = require('express-session')/* ,
    parseurl = require('parseurl'),
    store = new session.MemoryStore() */

//session va gérer la création/vérification du token lors du login
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false,
    maxAge: 1000 * 3600 * 24 * 365,
  },
  //store,
}))

app.use(function (req, res, next) {
  //res.header('Access-Control-Allow-Origin', '*')

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true)

  if (!req.session.user) {
    req.session.user = null
    req.session.isLogged = false
  }

  /*console.log('MEMORY STORE')
  console.log(store)*/

  // get the url pathname   pathname est la section de chemin de l'URL, qui vient après l'hôte et avant la requête
  // let pathname = parseurl(req).pathname
  // gestion des routes protégées

  // routes uniquement pour l'admin

  //conditions pour les accés aux routes avec restrictions qui redirigent vers le login si il n'est pas connecté ou admin

  next()
})

const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')
const annoncesRoutes = require('./routes/annoncesRoutes')


// Configuration de l'objet Promise utilisé par mongoose (ici, ce seront celles dans Node.js -> global.Promise)
mongoose.Promise = global.Promise;

// Adapter en fonction de la configuration sur le compte "Atlas"

let connectionString = process.env.MONGODB_LOCAL_URL

// Si dans le fichier .env on change la valeur de NODE_ENV et qu'on met
// 'prod', on se connectera à la base de données en ligne
// autre chose que 'prod', on se connectera à la base de données en locale
if (process.env.NODE_ENV === 'prod') {
  connectionString = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.ioylj.mongodb.net/Database?retryWrites=true&w=majority`
}

// Connexion à la base mongo :
mongoose
  //.connect(connectionString) // online
  //.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true }) // offline
  .connect(connectionString || connectionString, { useNewUrlParser: true, useUnifiedTopology: true }) // twices cases
  .then((db) => {
    // Démarrage du serveur (qui ne démarre QUE si la connexion à la base mongo est bien établie!)
    // console.log("CONNECTÉ")

    /* app.get('/', (req, res)=>{
      res.render('layout', {template: "home", name: "Home", session: req.session})
    }) */

    /* app.get('/essai', (req, res) =>{
        res.json({post: "tueur", crimes: 322})
    }) */
    //appel de nos routes
    authRoutes(app, db)
    userRoutes(app, db)
    annoncesRoutes(app, db)

    // Bien utiliser .PORT pour utiliser le port d'heroku
    // 3306 c'est pour le local
    app.listen(process.env.PORT || 3306, function() {
      console.log('serveur prêt')
    });
  })
  .catch(err => console.error(err.message));
