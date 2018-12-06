import { createLogger, format, transports } from 'winston'
// See `logform` module to know exactly how each format work.
const { combine, timestamp, printf, colorize, simple, json, uncolorize, prettyPrint, ms } = format
const LEVEL = Symbol.for('level')

const argv = process.argv
let withColors = true
if (argv.indexOf('--no-color') !== -1 || argv.indexOf('--color=false') !== -1) {
  withColors = false
}

const defaultLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ? 'info' : 'debug')

// Custom prettyPrint (only for exception stacks).
const tinyPrettyPrint = withColors

//
// Add some important data for our own usage.
//
const homairCustomDataFormatter = format(info => {
  if (!info) info = {}
  // Très important pour ne pas ajouter logname dans l'objet donné en info!
  else info = Object.assign({}, info)

  // info.logname = loggerName

  if (info.err) {
    if (info.err instanceof Error) {
      info.stack = info.err.stack
      if (info.stack && tinyPrettyPrint) {
        info.stack = info.stack.split(/\n/)
      }

      delete info.err
    } else {
      // Si erreur pas de type Error, on se crée une stack manuellement.
      // On conserve tout de meme l'err.
      info.stack = new Error().stack

      // Tentative de stringify
      info.err_string = JSON.stringify(info.err)
    }
  }

  if (info.req && info.req instanceof Object && typeof info.req.get === 'function') {
    if (info[LEVEL] === 'warn' || info[LEVEL] === 'error') {
      info.userAgent = info.req.get('User-Agent')
      info.referer = info.req.get('referer')
      info.ip = info.req.ip
    }

    let reqId = info.req.headers['x-request-id'] || (info.req.body && info.req.body.request_id) || info.req.query.request_id
    info.requestId = reqId

    delete info.req
  }

  // delete info.timestamp

  return info
})

//
// Custom flat console formatter.
//
const myConsoleFormatter = printf(({ timestamp, ms, level, message, ...rest }) => `${timestamp} (${ms}) ${level}: ${message} ${JSON.stringify(rest)}`)

let transportOptions = {
  level: defaultLevel,
  handleExceptions: true,
  exitOnError: false,
  format: combine(uncolorize(), homairCustomDataFormatter(), json()),
  // stringify: !withColors ? (obj) => JSON.stringify(obj) : undefined,
  // colorize: withColors ? winston.format.colorize() : false,
  // timestamp: withColors ? () => (new Date()).toISOString() : undefined,
  // prettyPrint: false,
}

if (withColors) {
  transportOptions.format = combine(
    // label({ label: 'right meow!' }),
    // Timestamp appended only if colors asked, generally in DEV. Heroku already has a timestamp from the Http proxy.
    timestamp(),
    ms(),
    colorize(),
    homairCustomDataFormatter(),
    myConsoleFormatter,
    // simple()
    // prettyPrint()
  )
}

let transportsArray = [new transports.Console(transportOptions)]

const logger = createLogger({
  ...transportOptions,
  transports: transportsArray,
})

export default logger
