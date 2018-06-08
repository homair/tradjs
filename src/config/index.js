const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3002,
  db: {
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost/honodblive',
      dbname: 'honodblive'
    },
    root_collection: process.env.ROOT_COLLECTION || 'i18next_flat'    // ### => i18next | i18next_flat
  },
  // Ips authorized to access to exports.
  // No HTTP auth for those.
  authorizedIps: ['127.0.0.1', '195.25.103.29'],
  langs: {
    'fr': {
      'label': 'French',
      'order': 0
    },
    'en': {
      'label': 'English',
      'order': 1
    },
    'de': {
      'label': 'German',
      'order': 2
    },
    'es': {
      'label': 'Spanish',
      'order': 3
    },
    'it': {
      'label': 'Italien',
      'order': 4
    },
    'nl': {
      'label': 'Dutch',
      'order': 5
    },
    'pl': {
      'label': 'Polish',
      'order': 5
    }
  },
  // order to sort docs
  lang_order: ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl'],
  flat_collection: process.env.FLAT_COLLECTION === 'true',  // ### => false | true
  translationNamespace: 'translation'
}

export default config
