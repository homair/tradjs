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
  console.log(req.body)
  //  console.log('[config.langs] ' , [config.langs])
  for (let lang in config.langs) {
    getDb().collection('i18next').updateOne({'language': lang}, {$unset: {[req.body.key]: req.body.value}})
  }
  res.send('clé supprimé')
})

// -------------------------------------------------
// Recup de tous les labels
// -------------------------------------------------
router.get('/', (req, res) => {
  // console.log(req.query)

  getOrderedDocs(config.langs, function (params) {
    // console.log(params)

    if (params.err) {
      console.error('main.js:', params.err)
      return res.render('errors/500', {msg: params.err})
    }

    // ------------------------------------------------
    // Envoi des informations désirées côté client
    // ------------------------------------------------
    res.render('index', params)
  })
// console.log('params ', params)
})

// Finally, manage routes that haven't been catched... 40x, 50x...
router.use(httpErrorController)

export default router

function parseSimpleObject (obj, objReturn, keyPath) {
  for (let element in obj) {
    if (typeof obj[element] === 'string') {
      objReturn[keyPath + element] = obj[element]
    } else if (typeof obj[element] === 'object') {
      keyPath = keyPath + element + '.'

      parseSimpleObject(obj[element], objReturn, keyPath)
    }
  }
}
/**
 * [getOrderedDocs description]
 * @param  {[type]}   langs    [description]
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
function getOrderedDocs (langs, callback) {
  // Recupère l'ensemble des documents de la collection "i18next" en fonction de la langue défini dans la config.
  getDb().collection('i18next').find({'language': {$in: [...Object.keys(langs)]}}).toArray((err, docs) => {
    if (err) {
      callback({'err': err})
    }
    // -----------------------------------------------------------------------------------------------
    // Fonction qui tri les documents sortis de la base de données : Fr en premier, puis anglais etc...
    // -----------------------------------------------------------------------------------------------
    let ordDoc = _.sortBy(docs, function (o) {
      return langs[o.language].order
    })
    console.log('i18nex ordDoc='.yellow, ordDoc)

    // ----------------------------------------------------
    // Mise en place des labels pour le header du template
    // ----------------------------------------------------
    let listeLang = langs
    // ------------------------------------------------------------------------------------
    // Affichage des documents côté serveur selon nos besoins (clé|valFR|valEN|...etc)
    // ------------------------------------------------------------------------------------
    let objetFinale = {}
    ordDoc.forEach((doc, index) => {
      let objReturn = {}

      for (let cle in doc.data) {
        let keyPath = cle + '.'
        if (typeof doc.data[cle] === 'string') {
          objReturn[cle] = doc.data[cle]
        } else {
          parseSimpleObject(doc.data[cle], objReturn, keyPath)
        }
        objetFinale[doc.language] = objReturn
      }
    })

    callback({'objetFinale': objetFinale, 'listeLang': listeLang})
  })
}
