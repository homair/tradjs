const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3002,
  db: {
    mongodb: process.env.MONGODB_URI || 'mongodb://localhost/honodbpreview',
    root_collection: process.env.ROOT_COLLECTION || 'i18next'
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

export default config
