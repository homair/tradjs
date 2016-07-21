import fs from 'fs'
import path from 'path'
import _ from 'lodash'

// grab common config
let config = require('./config_common')

// Deep extend : allow us to override only one field in a subobject.
_.deepObjectExtend = function (target, source) {
  for (var prop in source) {
    if (typeof target[prop] === 'object' && typeof source[prop] === 'object' && prop in target) {
      _.deepObjectExtend(target[prop], source[prop])
    } else {
      target[prop] = source[prop]
    }
  }
  return target
}

if (undefined === process.env.NODE_ENV || process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
  mergeConfig('dev')
}

if (process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'production') {
  mergeConfig('prod')
}

if (process.env.NODE_ENV === 'staging') {
  mergeConfig('staging')
}

if (process.env.NODE_ENV === 'test') {
  mergeConfig('test')
}

module.exports = config

function mergeConfig (env) {
  const filename = path.join(__dirname, 'config_' + env + '.js')
  if (fs.existsSync(filename)) {
    let readedConfig = require('./config_' + env)
    config = _.deepObjectExtend(config, readedConfig)
  }
}
