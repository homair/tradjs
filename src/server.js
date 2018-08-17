// Point d’entrée du serveur
// =========================

import { createServer } from 'http'
import logger from './lib/customLogger'

import 'colors'

import app from './app'

import { DB_DEFAULT, DB_AR, connect as dbConnect } from './lib/mongodb_util'

// Crée le conteneur principal de web app (`app`), connecte le serveur HTTP dessus
// (`server`) et détermine le chemin complet des assets statiques.
const server = createServer(app)

// Connexion à la base
dbConnect(DB_DEFAULT, (err, db) => {
  logger.info('✔ Connection established to '.green + DB_DEFAULT.cyan + ' database'.green)

  dbConnect(DB_AR, (err, db) => {
    logger.info('✔ Connection established to '.green + DB_AR.cyan + ' database'.green)

    // Lancement effectif du serveur en écoutant sur le bon port pour des
    // connexions HTTP entrantes.  Le port par défaut est 3000 (voir plus haut).
    server.listen(app.get('port'), () => {
      logger.info('✔ Server listening on ' + ('http://localhost:' + app.get('port')).yellow)
    })
  })
})

export default server
