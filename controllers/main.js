// Contrôleur principal
import { Router } from 'express'
import httpErrorController from './httpErrors'
import { getDb } from '../lib/mongodb_util'

// routeur Express
const router = new Router()

// -------------------------------------------------
// Update d'un label
// -------------------------------------------------
router.post('/update', (req, res) => {
  res.json({msg: 'Updated !'})
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

  // Recupère l'ensemble des documents de la collection "i18next".
  getDb().collection('i18next').find({}).toArray((err, labels) => {
    if (err) {
      console.error('main.js:', err)
      return res.render('errors/500', {msg: err})
    }

    console.log('i18next labels='.yellow, labels)
    res.render('index', {labels: labels})
  })
})

// Finally, manage routes that haven't been catched... 40x, 50x...
router.use(httpErrorController)

export default router
