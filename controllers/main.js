// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import { getDb } from '../lib/mongodb_util'
import $ from 'jquery'
import config from '../config/'
import 'colors'
import _ from 'lodash'
// routeur Express
const router = new Router()

// -------------------------------------------------
// Update d'un label
// -------------------------------------------------
router.post('/update', (req, res) => {
  console.log(req.body)

  getDb().collection('i18next').updateOne({'language': req.body.language}, {$set: {[req.body.key]: req.body.value}})

  res.send('ok' + req.body.key)
})

// -------------------------------------------------
// Suppression d'un label
// -------------------------------------------------
router.delete('/delete', (req, res) => {
  res.json({msg: 'Updated !'})
})

// -------------------------------------------------
// Recup de tous les labels
// -------------------------------------------------
router.get('/', (req, res) => {
  console.log(req.query)

  // Recupère l'ensemble des documents de la collection "i18next" en fonction de la langue défini dans la config.
  getDb().collection('i18next').find({'language': {$in: [...Object.keys(config.langs)]}}).toArray((err, docs) => {
    if (err) {
      console.error('main.js:', err)
      return res.render('errors/500', {msg: err})
    }
    // -----------------------------------------------------------------------------------------------
    // Fonction qui tri les documents sortis de la base de données : Fr en premier, puis anglais etc...
    // -----------------------------------------------------------------------------------------------
    let ordDoc = {}
    ordDoc = _.sortBy(docs, function (o) {
      return config.langs[o.language].order
    })
    console.log('i18nex docs='.yellow, ordDoc)

    // ----------------------------------------------------
    // Mise en place des labels pour le header du template
    // ----------------------------------------------------
    let listeLang = {}
    listeLang = config.langs
    // ------------------------------------------------------------------------------------
    // Affichage des documents côté serveur selon nos besoins (clé|valFR|valEN|...etc)
    // ------------------------------------------------------------------------------------
    let objetFinale = {}
    ordDoc.forEach((doc, index) => {
      // var AffichageCle = doc.language === 'fr'
      [doc.data].forEach((data, index) => {
        let objReturn = {}
        let keyPath = ''
        parseSimpleObject(data, objReturn, keyPath)
        objetFinale[doc.language] = objReturn
      })
    })
    // ------------------------------------------------
    // Envoi des informations désirées côté client
    // ------------------------------------------------
    res.render('index', {'docs': docs, 'objetFinale': objetFinale, 'listeLang': listeLang})
  })
})

// Finally, manage routes that haven't been catched... 40x, 50x...
router.use(httpErrorController)

export default router

function parseSimpleObject (obj, objReturn, keyPath) {
  for (let element in obj) {
    if (typeof obj[element] === 'string') {
      objReturn[keyPath + element] = obj[element]
      keyPath = ''
    } else if (typeof obj[element] === 'object') {
      keyPath = keyPath + element + '.'

      parseSimpleObject(obj[element], objReturn, keyPath)
    }
  }
}
