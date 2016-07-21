import { MongoClient } from 'mongodb'
import config from '../config'

let _db = false

export function connect (callback) {
  MongoClient.connect(config.db.mongodb, (err, db) => {
    if (err) {
      return callback(err)
    }

    _db = db
    return callback(null, db)
  })
}

export function getDb () {
  return _db
}
