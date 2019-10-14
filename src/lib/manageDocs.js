import { getDb, DB_PO } from '../lib/mongodb_util'
import MongoDB from 'mongodb'
import _ from 'lodash'
import config from '../config/'
import logger from './customLogger'
import { each } from 'async'

// -----------------------------------------------------------------------------------------------------------------------
// Fonction qui permet de parcourir les documents de la base et de déplier tous les objets pour tout avoir au même niveau
// -----------------------------------------------------------------------------------------------------------------------
// collector: {
//   'A.A1.A1œ1': { fr: 'val_fr', en: 'val_en'}
//   ...
// }
export function parseSimpleObject(obj, key, parentKey, collector, lang) {
  // logger.debug('key, parentKey, collector', key, parentKey, collector)
  if (typeof obj[key] === 'string') {
    const newKey = (parentKey ? `${parentKey}.` : '') + key
    if (!collector[newKey]) collector[newKey] = {}
    collector[newKey][lang] = obj[key]
  } else if (typeof obj[key] === 'object') {
    Object.keys(obj[key]).forEach(function(subkey) {
      parseSimpleObject(obj[key], subkey, (parentKey ? `${parentKey}.` : '') + key, collector, lang)
    })
  }
}

/**
 * [getOrderedDocs description]
 * @param  {[type]}   langs    [description]
 * @param  {Function} callback [description]
 * @return {Object}            [description]
 */
export function getOrderedDocs(dbKey, langs, callback) {
  if (config.flat_collection === true) {
    getFlatOrderedDocs(dbKey, langs, callback)
  } else {
    getRegularOrderedDocs(dbKey, langs, callback)
  }
}

export function getRegularOrderedDocs(dbKey, langs, callback) {
  logger.debug('getRegularOrderedDocs')
  const hrstart = process.hrtime()
  /* ------ Recupère l'ensemble des documents de la collection "i18next" en fonction de la langue défini dans la config. -------- */
  getDb(dbKey)
    .collection(config.db.root_collection)
    .find({ language: { $in: [...Object.keys(langs)] }, namespace: config.db[dbKey].translationNamespace })
    .toArray((err, docs) => {
      if (err) {
        callback(err, null)
      }
      // -----------------------------------------------------------------------------------------------
      // Fonction qui tri les documents sortis de la base de données : Fr en premier, puis anglais etc...
      // -----------------------------------------------------------------------------------------------
      let ordDoc = _.sortBy(docs, function(o) {
        return langs[o.language].order
      })

      // ----------------------------------------------------
      // Mise en place des labels pour le header du template
      // ----------------------------------------------------
      let listeLang = langs
      // ------------------------------------------------------------------------------------
      // Affichage des documents côté serveur selon nos besoins (clé|valFR|valEN|...etc)
      // ------------------------------------------------------------------------------------
      //
      let objReturn = {}

      ordDoc.forEach((doc, index) => {
        for (let cle in doc.data) {
          parseSimpleObject(doc.data, cle, '', objReturn, doc.language)
        }
      })

      let results = []
      for (let key in objReturn) {
        results.push({
          key,
          ...objReturn[key],
        })
      }
      results.sort(customSortFunc)

      const hrend = process.hrtime(hrstart)
      logger.info('[getRegularOrderedDocs] Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

      callback(null, { results: results, listeLang: listeLang })
    })
}

export function getFlatOrderedDocs(dbKey, langs, callback) {
  const hrstart = process.hrtime()

  const filters = {
    language: { $in: [...Object.keys(langs)] },
    // On recup le namespace courant et PO (pour afficher des flags 'overriden')
    namespace: { $in: [config.db[dbKey].translationNamespace, config.db[DB_PO].translationNamespace] },
    //DEBUG: key: 'data.common.labels.logo.link_href_logo_secondaire',
  }

  logger.debug(`getFlatOrderedDocs, dbKey=${dbKey}, filters=${JSON.stringify(filters)}`)

  // ------ Recupère l'ensemble des documents de la collection "i18next" en fonction de la langue défini dans la config. --------
  getDb(dbKey)
    .collection(config.db.root_collection)
    .aggregate([
      {
        $match: filters,
      },
      { $sort: { key: 1, language: 1 } },
      {
        $group: {
          _id: '$key',
          values: {
            $push: {
              lang: '$language',
              value: '$data',
              namespace: '$namespace',
              _id: '$$ROOT._id',
            },
          },
        },
      },
      { $project: { key: '$_id', values: 1 } },
    ])
    .toArray((err, docs) => {
      if (err) {
        callback(err, null)
      }
      // console.log(require('util').inspect(docs, { depth: 6 }))
      // recombine docs
      // { key: 'page.park.aquapark.rightBlock.title',
      // fr: 'Informations pratiques',
      // en: 'Useful information',
      // de: 'Praktische Informationen',
      // es: 'Informaciones prácticas',
      // it: 'Informazioni pratiche',
      // nl: 'Praktische informatie' },

      let objReturn = []
      let curr
      if (Array.isArray(docs)) {
        docs.forEach(el => {
          // store key
          curr = { key: el.key, translations: {} }

          const isOverridden = {}

          // console.log('VALUES=', el.values)

          const newValues = []
          el.values.forEach(v => {
            // On regarde dans le namespace PO si overriden (uniquement si Homair).
            if (dbKey == 'default' && v.namespace == config.db[DB_PO].translationNamespace) {
              isOverridden[v.lang] = true
            } else {
              // on stocke le namespace courant uniquement
              newValues.push(v)
            }
          })

          // transform values to object indexed on lang
          const oValues = _.keyBy(newValues, 'lang')

          //console.log('oValues=', oValues)

          // store values in order
          config.lang_order[dbKey].forEach(lang => {
            if (oValues[lang] && oValues[lang].value) {
              curr.translations[lang] = {
                ...oValues[lang],
                isOverridden: isOverridden[lang],
              }

              // Si au moins une langue overriden, marquer la ligne.
              if (isOverridden[lang]) {
                curr.isOverridden = true
              }
            }
          })

          objReturn.push(curr)
        })
      }

      // console.log('------------ objReturn = ', require('util').inspect(objReturn, { depth: 6 }))

      const results = _.sortBy(objReturn, 'key')

      const hrend = process.hrtime(hrstart)
      logger.info('[getFlatOrderedDocs] Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)

      callback(null, { results: results, listeLang: langs })
    })
}

// --------------------------------------------------------------------------------
// Fonction qui tri par ordre alphabétique
// --------------------------------------------------------------------------------
export function customSortFunc(a, b) {
  if (a.key < b.key) {
    return -1
  } else if (a.nom === b.nom) {
    return 1
  } else {
    return 1
  }
}

// --------------------------------------------------------------------------------
// Fonction qui envoit une requête à la base pour modifier les valeurs du tableau
// --------------------------------------------------------------------------------
export function updateRoute(req, res) {
  const dbKey = req.session.currentDb

  // if we are on flat_collections
  if (config.flat_collection === true) {
    let where = { language: req.body.language, namespace: config.db[dbKey].translationNamespace, key: req.body.key }
    if (req.body._id) {
      where = { _id: new MongoDB.ObjectID(req.body._id) }
      logger.info(`updateRoute: UPDATE, where=${JSON.stringify(where)}, key="${req.body.key}", value="${JSON.stringify(req.body.value)}"`)
    } else {
      logger.info(`updateRoute: INSERT, where=${JSON.stringify(where)}, key="${req.body.key}", value="${JSON.stringify(req.body.value)}"`)
    }

    getDb(dbKey)
      .collection(config.db.root_collection)
      .updateOne(where, { $set: { data: String(req.body.value) } }, { upsert: true }, (err, result) => {
        if (err) {
          logger.error(`updateRoute: err="${err}"`, { err })
          return res.status(500).send(err)
        }
        res.send('ok')
      })
  } else {
    getDb(dbKey)
      .collection(config.db.root_collection)
      .updateOne({ language: req.body.language }, { $set: { [req.body.key]: req.body.value } }, (err, result) => {
        if (err) {
          logger.error(`updateRoute: err="${err}"`, { err })
          return res.status(500).send(err)
        }
        res.send('ok')
      })
  }
}

// ----------------------------------------------------------------------------------------------------
// Fonction qui envoit une requête à la base pour supprimer les clé et valeurs dans toutes les langues
// ----------------------------------------------------------------------------------------------------
export function deleteRoute(req, res) {
  const dbKey = req.session.currentDb

  // if we are on flat_collections
  if (config.flat_collection === true) {
    //for (let lang in config.langs[dbKey]) {
    each(
      Object.keys(config.langs[dbKey]),
      function(lang, asyncCb) {
        const where = { language: lang, namespace: config.db[dbKey].translationNamespace, key: req.body.key }

        logger.info(`deleteRoute: DELETE, where=${JSON.stringify(where)}, key="${req.body.key}"`)

        getDb(dbKey)
          .collection(config.db.root_collection)
          .deleteOne(where, (err, result) => {
            if (err) {
              return asyncCb(err)
            }
            logger.debug(`deleteRoute: where = ${JSON.stringify(where)}, deletedCount=${result.deletedCount}`)

            asyncCb()
          })
      },
      err => {
        if (err) {
          logger.error(`deleteRoute: (flat format) err="${err}"`, { err })
          return res.status(500).send(err)
        }
        res.send('ok')
      },
    )
  } else {
    each(
      config.langs[dbKey],
      function(lang, asyncCb) {
        getDb(dbKey)
          .collection(config.db.root_collection)
          .deleteOne({ language: lang }, { $unset: { [req.body.key]: '' } }, (err, result) => {
            if (err) {
              asyncCb(err)
            }

            logger.debug(`deleteRoute: (Object format) where = ${JSON.stringify({ language: lang })}, deletedCount=${result.deletedCount}`)

            asyncCb()
          })
      },
      err => {
        if (err) {
          logger.error(`deleteRoute: (object format) err="${err}"`, { err })
          return res.status(500).send(err)
        }
        res.send('ok')
      },
    )
  }
}

// EXPLICIT function that duplicate a key to PalmierOcean FR
// Volontary simple to handle the main case for now (HV->PO, FR only)
export function duplicateToPalmierRoute(req, res) {
  const dbKey = req.session.currentDb
  // if we are on flat_collections
  if (config.flat_collection === true) {
    // get FR value (as it's only in FR for now)
    let where = { language: 'fr', namespace: config.db[dbKey].translationNamespace, key: req.body.key }
    getDb(dbKey)
      .collection(config.db.root_collection)
      .findOne(where, (err, result) => {
        if (err || !result) {
          logger.error(`duplicateToPalmierRoute: ${err ? `err=${err}` : 'key not found / result is empty'}`, { err })
          return res.status(500).send(err)
        }

        // insert key and value insite Palmier Ocean namespace
        where.namespace = config.db[DB_PO].translationNamespace
        getDb(DB_PO)
          .collection(config.db.root_collection)
          .updateOne(where, { $set: { data: String(result.data) } }, { upsert: true }, (err, result) => {
            if (err) {
              logger.error(`duplicateToPalmierRoute: err="${err}"`, { err })
              return res.status(500).send(err)
            }
            res.send('ok')
          })
      })
  } else {
    res.status(500).send('i18n "object" collection not handled')
  }
}
