export default {
  env: 'dev',
  port: process.env.PORT || 3002,
  db: {
    mongodb: process.env.MONGODB_URL || 'mongodb://localhost/honodbpreview'
  },
  langs: {
    'fr': {
      'label': 'Français',
      'order': 0
    },
    'en': {
      'label': 'Anglais',
      'order': 1
    },
    'de': {
      'label': 'Allemand',
      'order': 2
    },
    'es': {
      'label': 'Espagnol',
      'order': 3
    },
    'it': {
      'label': 'Italien',
      'order': 4
    },
    'nl': {
      'label': 'Hollandais',
      'order': 5
    }
  }
}
