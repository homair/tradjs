import { getDb } from '../lib/mongodb_util'
import _ from 'lodash'
import config from '../config/'

// -----------------------------------------------------------------------------------------------------------------------
// Fonction qui permet de parcourir les documents de la base et de déplier tous les objets pour tout avoir au même niveau
// -----------------------------------------------------------------------------------------------------------------------
// collector: {
//   'A.A1.A11': { fr: 'val_fr', en: 'val_en'}
//   ...
// }
export function parseSimpleObject (obj, key, parentKey, collector, lang) {
  // console.log('key, parentKey, collector', key, parentKey, collector)
  if (typeof obj[key] === 'string') {
    const newKey = (parentKey ? parentKey + '.' : '') + key
    if (!collector[ newKey ]) collector[ newKey ] = {}
    collector[ newKey ][ lang ] = obj[key]
  } else if (typeof obj[key] === 'object') {
    Object.keys(obj[key]).forEach(function (subkey) {
      parseSimpleObject(obj[key], subkey, (parentKey ? parentKey + '.' : '') + key, collector, lang)
    })
  }
}

/**
 * [getOrderedDocs description]
 * @param  {[type]}   langs    [description]
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
export function getOrderedDocs (langs, callback) {
  // Recupère l'ensemble des documents de la collection "i18next" en fonction de la langue défini dans la config.
  getDb().collection('i18next').find({'language': {$in: [...Object.keys(langs)]}}).toArray((err, docs) => {
    if (err) {
      callback(err, null)
    }
    // -----------------------------------------------------------------------------------------------
    // Fonction qui tri les documents sortis de la base de données : Fr en premier, puis anglais etc...
    // -----------------------------------------------------------------------------------------------
    let ordDoc = _.sortBy(docs, function (o) {
      return langs[o.language].order
    })
    // console.log('i18nex ordDoc='.yellow, ordDoc)

    // ----------------------------------------------------
    // Mise en place des labels pour le header du template
    // ----------------------------------------------------
    let listeLang = langs
    // ------------------------------------------------------------------------------------
    // Affichage des documents côté serveur selon nos besoins (clé|valFR|valEN|...etc)
    // ------------------------------------------------------------------------------------
    //
    let objReturn = {}

    // const hrstart = process.hrtime()
    ordDoc.forEach((doc, index) => {
      for (let cle in doc.data) {
        parseSimpleObject(doc.data, cle, '', objReturn, doc.language)
      }
    // const hrend = process.hrtime(hrstart)
    // console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
    })
    // console.log('objReturn', objReturn)
    callback(null, {'objReturn': objReturn, 'listeLang': listeLang})
  })
}

// --------------------------------------------------------------------------------
// Fonction qui envoit une requête à la base pour modifier les valeurs du tableau
// --------------------------------------------------------------------------------
export function updateRoute (req, res) {
  getDb().collection('i18next').updateOne({'language': req.body.language}, {$set: {[req.body.key]: req.body.value}}, (err, result) => {
    if (err) {
      console.log('updateRoute : err', err)
      return res.status(500).send(err)
    }

    res.send('clé updated')
  })
}

// ----------------------------------------------------------------------------------------------------
// Fonction qui envoit une requête à la base pour supprimer les clé et valeurs dans toutes les langues
// ----------------------------------------------------------------------------------------------------
export function deleteRoute (req, res) {
  let finished = 0
  console.log(req.body)
  for (let lang in config.langs) {
    getDb().collection('i18next').updateOne({'language': lang}, {$unset: {['data.' + req.body.key]: ''}}, (err, result) => {
      if (err) {
        console.log(' deleteRoute : err', err)
        return res.status(500).send(err)
      }
      finished++
      if (finished === Object.keys(config.langs).length) {
        res.send('clé supprimé')
      }
    })
  }
}
