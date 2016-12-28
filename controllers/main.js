// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import config from '../config/'
import 'colors'
import logger from '../lib/customLogger'
import { getOrderedDocs, updateRoute, deleteRoute } from '../lib/manageDocs'

const router = new Router()

// Authentification
router.all('*', (req, res, next) => {
  const auth = {login: 'homair', password: 'site2016'} // change this
  const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
  const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')
  // Verify login and password are set and correct
  if (!login || !password || login !== auth.login || password !== auth.password) {
    res.set('WWW-Authenticate', 'Basic realm="Homair Vacances"')
    res.status(401).send('Please provide valid credentials...')
    logger.info(`Authentication failed with login=${login} and password=${password}`)
    return
  }
  // -----------------------------------------------------------------------
  // Access granted...
  logger.debug('Authentification cleared')
  next()
})

// -------------------------------------------------
// Update d'un label
// -------------------------------------------------
router.post('/update', (req, res) => {
  logger.info('endpoint=update', req.body)
  if (typeof req.body.key === 'undefined' || typeof req.body.value === 'undefined' || typeof req.body.language === 'undefined') {
    logger.error('endpoint=update, Error : missing datas to update records')
    res.status(500).json({msg: 'Des paramètres sont manquants'})
  } else {
    updateRoute(req, res)
  }
})

// -------------------------------------------------
// Suppression d'un label
// -------------------------------------------------
router.delete('/delete', (req, res) => {
  logger.info('endpoint=delete', req.body)
  if (typeof req.body.key === 'undefined') {
    logger.error('endpoint=delete, Error : missing parameters to delete key')
    res.status(500).json({msg: 'Des paramètres sont manquants'})
  } else {
    logger.warn(`endpoint=delete, translation key=${req.body.key} deleted !`)
    deleteRoute(req, res)
  }
})

// Recup d'un document
router.get('/doc_by_language/:lang', (req, res) => {
  const myLanguageConfig = {[req.params.lang]: config.langs[req.params.lang]}

  getOrderedDocs(myLanguageConfig, function (err, params) {
    if (err) {
      logger.error('main.js, doc_by_language:', err)
      return res.status(500).json(err)
    }
    res.json(params)
  })
})

// -------------------------------------------------
// Recup de tous les labels
// -------------------------------------------------
router.get('/', (req, res) => {
  getOrderedDocs(config.langs, function (err, params) {
    if (err) {
      logger.error('main.js:', err)
      return res.render('errors/500', err)
    }

    // ------------------------------------------------
    // Envoi des informations désirées côté client
    // ------------------------------------------------
    return res.render('index', params)
  })
})
router.use(httpErrorController)

export default router
