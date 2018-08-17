const merge = require('webpack-merge')
const parts = require('./webpack.config.parts')
const Path = require('path')

var PACKAGE = require('./package.json')
var version = PACKAGE.version

const PATHS = {
  build: Path.resolve(__dirname, 'public'),
  source: Path.resolve(__dirname, 'client'),
}

const coreConfig = merge(
  {
    mode: !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'development' : 'production',
    entry: {
      tradjs: [PATHS.source] /* 'babel-polyfill', */,
    },
    output: {
      devtoolModuleFilenameTemplate: 'webpack:///[resource-path]',
      filename: '[name].js',
      path: PATHS.build,
      publicPath: '/',
    },
    optimization: {
      // https://webpack.js.org/configuration/optimization/#optimization-runtimechunk
      runtimeChunk: false,
      // https://webpack.js.org/plugins/split-chunks-plugin/#defaults
      // splitChunks: {
      //   chunks: 'all'
      // }
    },
  },
  parts.generateSourceMaps(),
  parts.babelize({
    include: PATHS.source,
    options: { plugins: ['syntax-dynamic-import'] },
  }),
  parts.ignoreMomentLocales(),
  // parts.loadImages(),
  // parts.loadFonts(),
  // parts.html({ title: 'Webpack 4 - Premiers Pas' }),
  // parts.safeAssets(),
  // parts.useModuleLevelCache()
)

const devConfig = () =>
  merge.smart(
    coreConfig,
    parts.dashboard(),
    // parts.devServer({ port: 3004 }),
    parts.loadCSS({ modules: false }),
    parts.loadSASS({ modules: false }),
  )

const prodConfig = () =>
  merge.smart(
    parts.cleanDist([PATHS.build], { exclude: ['favicon.ico', 'fonts', 'font-awesome.min.css'] }),
    coreConfig,
    {
      output: {
        // .[chunkhash:8]
        filename: '[name].' + version + '.js',
      },
    },
    parts.generateSourceMaps('source-map'),
    parts.extractCSS({ modules: false, version }),
    parts.extractSASS({ modules: false, version }),
    // parts.optimizeImages(),
    parts.compressTextFiles(),
  )

// console.log(require('util').inspect(devConfig(), { depth: 6 }))

module.exports = (env = process.env.NODE_ENV) => (env === 'production' ? prodConfig() : devConfig())
