import { MongoClient } from 'mongodb'
import config from '../config'
// Mutli-databases:
let _dbByKey = {}

export const DB_DEFAULT = 'default'
export const DB_PO = 'po'
export const DB_MRV = 'mrv'
export const DB_AR = 'assetregister'

export function connect(dbKey, callback) {
  MongoClient.connect(config.db[dbKey].uri, { useNewUrlParser: true }, (err, client) => {
    if (err) {
      return callback(err)
    }

    _dbByKey[dbKey] = client.db(config.db[dbKey].dbname)
    return callback(null, _dbByKey[dbKey])
  })
}

// Mutli-databases:
export function getDb(dbKey) {
  if (!dbKey) dbKey = DB_DEFAULT
  // HV, PO & MRV use the same DB.
  dbKey = dbKey === DB_AR ? DB_AR : DB_DEFAULT
  return _dbByKey[dbKey]
}
