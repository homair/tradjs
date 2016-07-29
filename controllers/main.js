// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import { getDb } from '../lib/mongodb_util'
import $ from 'jquery'
import config from '../config/'

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
  console.log(config.langs)
  // Recupère l'ensemble des documents de la collection "i18next".
  getDb().collection('i18next').find({'language': {$in: [...config.langs]}}).toArray((err, docs) => {
    if (err) {
      console.error('main.js:', err)
      return res.render('errors/500', {msg: err})
    }

    console.log('i18nex docs='.yellow, docs)
    res.render('index', {'docs': docs})
  })
})

// Finally, manage routes that haven't been catched... 40x, 50x...
router.use(httpErrorController)

export default router
