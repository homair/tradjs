// Connexion à mongoDB
// ===================
import config from './config/'
import { MongoClient } from 'mongodb'

mongodb.connect(config.db.mongodb)

// On prend soin de toujours indiquer si la connexion a échoué, car c’est
// pénible à diagnostiquer sinon.
const db = mongoose.connection
db.on('error', () => {
  console.error('✘ CANNOT CONNECT TO mongoDB DATABASE honodb!'.red)
})

// On exporte une fonction d'enregistrement d'un callback de connexion
// réussie, si ça intéresse l'appelant (`server.js` s'en sert pour confirmer
// dans la console que la connexion est prête).
//
// Ce n'est pas anodin, car Mongoose va mettre en file d'attente toute opération
// DB jusqu'à ce que la connexion soit établie, donc vérifier ce dernier point
// est utile.
export default function listenToConnectionOpen (onceReady) {
  if (onceReady) {
    db.on('open', onceReady)
  }
}
