import winston from 'winston'

const argv = process.argv
let withColors = true
if (argv.indexOf('--no-color') !== -1 || argv.indexOf('--color=false') !== -1 || process.env.NO_COLOR === 1) {
  withColors = false
}

const defaultLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? 'info' : 'debug')

let transports = [
  new winston.transports.Console({
    level: defaultLevel,
    handleExceptions: true,
    json: !withColors,
    stringify: !withColors ? (obj) => JSON.stringify(obj) : undefined,
    colorize: withColors,
    // Timestamp appended only if colors asked, generally in DEV. Heroku already has a timestamp from the Http proxy.
    timestamp: withColors ? () => (new Date()).toISOString() : undefined
  })
]

const logger = new winston.Logger({
  transports: transports,
  rewriters: [function (level, msg, meta) {
    if (!meta) meta = {}
    // Très important pour ne pas ajouter logname dans l'objet donné en meta!
    else meta = Object.assign({}, meta)
    // meta.logname = loggerName

    if (meta.err && meta.err instanceof Error) {
      meta.stack = meta.err.stack
      delete meta.err
    }

    return meta
  }]
})

export default logger
