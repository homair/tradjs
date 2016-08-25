// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import config from '../config/'
import 'colors'
import { getOrderedDocs, updateRoute, deleteRoute } from '../lib/manageDocs'

const router = new Router()

// -------------------------------------------------
// Update d'un label
// -------------------------------------------------
router.post('/update', (req, res) => {
  console.log(req.body)
  if (typeof req.body.key === 'undefined' || typeof req.body.value === 'undefined' || typeof req.body.language === 'undefined') {
    console.error('Des datas sont manquantes')
    res.status(500).json({msg: 'Des paramètres sont manquants'})
  } else {
    updateRoute(req, res)
  }
})

// -------------------------------------------------
// Suppression d'un label
// -------------------------------------------------
router.delete('/delete', (req, res) => {
  // console.log(req.body)
  if (typeof req.body.key === 'undefined') {
    console.error('main.js, delete: des paramètres sont manquants')
    res.status(500).json({msg: 'Des paramètres sont manquants'})
  } else {
    deleteRoute(req, res)
  }
})

// Recup d'un document
router.get('/doc_by_language/:lang', (req, res) => {
  const myLanguageConfig = {[req.params.lang]: config.langs[req.params.lang]}

  getOrderedDocs(myLanguageConfig, function (err, params) {
    if (err) {
      console.error('main.js, doc_by_language:', err)
      return res.status(500).json(err)
    }
    res.json(params)
  })
})

// -------------------------------------------------
// Recup de tous les labels
// -------------------------------------------------
router.get('/', (req, res) => {
  // console.log(req.query)

  getOrderedDocs(config.langs, function (err, params) {
    // console.log(params)

    if (err) {
      console.error('main.js:', err)
      return res.render('errors/500', err)
    }

    // ------------------------------------------------
    // Envoi des informations désirées côté client
    // ------------------------------------------------
    res.render('index', params)
  })
})
router.use(httpErrorController)

export default router
