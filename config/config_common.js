export default {
  env: 'dev',
  db: {
    mongodb: process.env.MONGODB_URL || 'mongodb://localhost/honodb'
  },
  langs: {
    'fr': { 'label': 'Français',
    'order': 0},
    'en': { 'label': 'Anglais',
    'order': 1},
    'de': {'label': 'Allemand',
    'order': 2},
    'es': {'label': 'Espagnol',
    'order': 3},
    'it': {'label': 'Italien',
    'order': 4},
    'nl': {'label': 'Hollandais',
    'order': 5}
  }
}
