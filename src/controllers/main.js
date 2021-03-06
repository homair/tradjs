// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import config from '../config/'
import 'colors'
import logger from '../lib/customLogger'
import { getOrderedDocs, updateRoute, deleteRoute, duplicateToPalmierRoute } from '../lib/manageDocs'
import { DB_AR, DB_PO, DB_DEFAULT, DB_MRV } from '../lib/mongodb_util'

const router = new Router()

// -----------------------------------------------------------------------
// HTTP authentication.
// -----------------------------------------------------------------------
// If current environnement doesn't correspond to this list.
if (['dev', 'test'].indexOf(process.env.NODE_ENV) === -1) {
  router.all('*', (req, res, next) => {
    // If the current client IP isn't authorized.
    if (config.authorizedIps.indexOf(req.ip) === -1) {
      const auth = { login: 'homair', password: 'site2016' } // change this
      const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
      const [login, password] = Buffer.from(b64auth, 'base64')
        .toString()
        .split(':')
      // Verify login and password are set and correct
      if (!login || !password || login !== auth.login || password !== auth.password) {
        res.set('WWW-Authenticate', 'Basic realm="Homair Vacances"')
        res.status(401).send('Please provide valid credentials...')
        return
      }
    }

    next()
  })
}
// -----------------------------------------------------------------------

// -------------------------------------------------
// Update d'un label
// -------------------------------------------------
router.post('/update', (req, res) => {
  logger.info('endpoint=update', req.body)
  if (!req.body.key || !req.body.language) {
    logger.error('endpoint=update, Error : missing datas to update records')
    res.status(500).json({ msg: 'Des paramètres sont manquants' })
  } else {
    updateRoute(req, res)
  }
})

// -------------------------------------------------
// Suppression d'un label
// -------------------------------------------------
router.delete('/delete', (req, res) => {
  logger.info('endpoint=delete', req.body)
  if (!req.body.key) {
    logger.error('endpoint=delete, Error : missing parameters to delete key')
    res.status(500).json({ msg: 'Des paramètres sont manquants' })
  } else {
    deleteRoute(req, res)
    logger.info(`endpoint=delete, translation key=${req.body.key} deleted !`)
  }
})

// -------------------------------------------------
// Duplicate key on Palmier Ocean
// -------------------------------------------------
router.post('/duplicate', (req, res) => {
  logger.info('endpoint=duplicate', req.body)
  if (!req.body.key) {
    logger.error('endpoint=duplicate, Error : missing parameters to duplicate key')
    res.status(500).json({ msg: 'Des paramètres sont manquants' })
  } else {
    duplicateToPalmierRoute(req, res)
    logger.info(`endpoint=duplicate, translation key=${req.body.key} duplicated on Palmier-Ocean !`)
  }
})

// Recup d'un document
router.get('/doc_by_language/:lang', (req, res) => {
  const myLanguageConfig = { [req.params.lang]: config.langs[req.session.currentDb][req.params.lang] }

  getOrderedDocs(req.session.currentDb, myLanguageConfig, function(err, params) {
    if (err) {
      logger.error('main.js, doc_by_language:', err)
      return res.status(500).json(err)
    }
    res.json(params)
  })
})

router.get('/switch-db', (req, res) => {
  if ([DB_AR, DB_PO, DB_MRV, DB_DEFAULT].indexOf(req.query.db) !== -1) {
    req.session.currentDb = req.query.db
    const suffix = req.query.v ? '?v=flat' : ''
    return res.redirect(`/${suffix}`)
  }
  return res.status(400).send('Wrong dbname')
})

// -------------------------------------------------
// Recup de tous les labels
// -------------------------------------------------
router.get('/', (req, res) => {
  getOrderedDocs(req.session.currentDb, config.langs[req.session.currentDb], function(err, params) {
    if (err) {
      logger.error('main.js: err=', err)
      return res.render('errors/500', { msg: err })
    }

    // display
    if (req.query && req.query.v === 'flat') {
      params.display = 'flat'
    }

    params.query = req.query

    // ------------------------------------------------
    // Envoi des informations désirées côté client
    // ------------------------------------------------
    return res.render('index', params)
  })
})
router.use(httpErrorController)

export default router
