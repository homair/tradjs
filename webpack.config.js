// Configuration Webpack
// =====================

// La configuration de Webpack peut être assez velue…
// Pour simplifier notre propre code de configuration,
// une bonne solution consiste à passer par
// [hjs-webpack](https://github.com/HenrikJoreteg/hjs-webpack),
// une surcouche de Henrik Joreteg.  On peut se contenter
// d’indiquer de quel fichier source partir, où publier
// les fichiers de production en cas de build, éventuellement
// si on souhaite du HTTPS, et on est prêts à partir.
// La simple présence des principaux plugins et loaders
// Webpack dans le fichier `package.json` et le dossier
// `node_modules` entraînera leur configuration automatique.

var getConfig = require('hjs-webpack')
const isDev = process.env.NODE_ENV !== 'production'
console.log('isDev  ', isDev)

var config = getConfig({
  hot: false,
  html: false,
  in: 'client/application.js',
  out: 'public',
  clearBeforeBuild: '!(images|fonts|favicon.ico|font-awesome.min.css)',
  output: {
    /* filename: 'tradjs.1.0.0.js', */
    path: __dirname + '/public'
  },
  isDev: false
})

if (isDev) {
  // Semble mieux fonctionner avec les devtools de Chrome, sinon
  // on pointe toujours sur la version app.js, pas sur les sources.
  config.devtool = 'inline-source-map'
  config.devServer = undefined
}

module.exports = config
