// Point d’entrée du serveur
// =========================

import { createServer } from 'http'

import 'colors'

import app from './app'

import { connect as dbConnect } from './lib/mongodb_util'

// Crée le conteneur principal de web app (`app`), connecte le serveur HTTP dessus
// (`server`) et détermine le chemin complet des assets statiques.
const server = createServer(app)

// Connexion à la base
dbConnect(() => {
  console.log('✔ Connection established to mongoDB database'.green)

  // Lancement effectif du serveur en écoutant sur le bon port pour des
  // connexions HTTP entrantes.  Le port par défaut est 3000 (voir plus haut).
  server.listen(app.get('port'), () => {
    console.log('✔ Server listening on port ', app.get('port'))
  })
})

export default server
