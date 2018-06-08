import { MongoClient } from 'mongodb'
import config from '../config'

let _db = false

export function connect (callback) {
  MongoClient.connect(config.db.mongodb.uri, (err, client) => {
    if (err) {
      return callback(err)
    }

    _db = client.db(config.db.mongodb.dbname)
    return callback(null, _db)
  })
}

export function getDb () {
  return _db
}
