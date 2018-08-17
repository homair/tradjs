// Application principale
// ======================

// get request data in req.body
import bodyParser from 'body-parser'
import compression from 'compression'
import express from 'express'
import { join as joinPaths } from 'path'
import morgan from 'morgan'
import config from './config/'
import cookieSession from 'cookie-session'

import mainController from './controllers/main'
import { DB_DEFAULT } from './lib/mongodb_util'

// Crée le conteneur principal de web app (`app`), connecte le serveur HTTP dessus
// (`server`) et détermine le chemin complet des assets statiques.
const app = express()
const publicPath = joinPaths(__dirname, '..', 'public')

// Configuration
// -------------

// Configuration et middleware pour tous les environnements (dev, prod, etc.)
app.set('port', config.port)
app.set('view engine', 'pug')
app.set('views', joinPaths(process.cwd(), '/src/views'))

// if (process.env.NODE_ENV === 'production') {
//   app.set('view cache', true)
// }

// set engine for app
app.engine('pug', require('pug').__express)

// Fonctionne derrière un proxy HTTP (sur heroku ou dev si reverse avec Apache/Nginx).
// http://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', true)

// compress content
// @see https://github.com/expressjs/compression for configuration
app.use(compression())

// Fichiers statiques.  En le chargeant tôt, on court-circuite immédiatement
// le reste des middlewares en cas de fichier statique…
app.use(express.static(publicPath, { maxAge: 86400000 }))

// ou pour travailler sur un point de montage :
// app.use('/static', express.static(__dirname + '/public'))

app.use(bodyParser.urlencoded({ extended: true }))

if (app.get('env') !== 'test') {
  app.use(morgan(app.get('env') === 'development' ? 'dev' : 'combined'))
}

// `cookieSession` stocke la session complète en cookie, pas en mémoire serveur,
// ce qui résiste aux redémarrages (notamment en dev avec `nodemon`) mais pose des
// contraintes de taille (4Ko max JSONifié + base64-encodé).
// https://github.com/expressjs/cookie-session#max-cookie-size
app.use(cookieSession({ name: 'tradjs:session', secret: 'HomR-Vac-TradJS' }))

// Configuration uniquement hors production
if (app.get('env') !== 'production') {
  // Variable spéciale utilisée par Jade pour ne pas minifier le HTML
  app.locals.pretty = true
}

// Variables automatiques dans les vues
// ------------------------------------

// Rend l’URL et les paramètres de requête accessibles à toutes les vues
app.use((req, res, next) => {
  // Variables locales partagées par toutes les vues
  res.locals.title = 'Homair vacances'
  res.locals.query = req.query
  res.locals.url = req.url

  req.session.currentDb = req.session.currentDb || DB_DEFAULT
  res.locals.currentDb = req.session.currentDb

  next()
})

// Middlewares et routes applicatifs
// ---------------------------------
app.use(mainController)

export default app
