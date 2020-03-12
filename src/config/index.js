const config = {
  env: process.env.NODE_ENV || 'dev',
  port: process.env.PORT || 3002,
  db: {
    // Multi-databases & multi-namespaces
    default: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/honodblive',
      dbname: process.env.MONGODB_NAME || 'honodblive',
      translationNamespace: 'translation',
    },
    po: {
      translationNamespace: 'palmier-ocean',
    },
    mrv: {
      translationNamespace: 'mrv',
    },
    assetregister: {
      uri: process.env.MONGODB_URI_ASSETREGISTER || 'mongodb://localhost:27017/basemh',
      dbname: process.env.MONGODB_NAME_ASSETREGISTER || 'basemh',
      translationNamespace: 'translation',
    },
    root_collection: process.env.ROOT_COLLECTION || 'i18next_flat', // ### => i18next | i18next_flat
  },
  // Ips authorized to access to exports.
  // No HTTP auth for those.
  authorizedIps: ['127.0.0.1', '195.25.103.29'],
  langs: {
    // Multi-databases:
    default: {
      fr: {
        label: 'French',
        order: 0,
      },
      en: {
        label: 'English',
        order: 1,
      },
      de: {
        label: 'German',
        order: 2,
      },
      es: {
        label: 'Spanish',
        order: 3,
      },
      it: {
        label: 'Italien',
        order: 4,
      },
      nl: {
        label: 'Dutch',
        order: 5,
      },
      pl: {
        label: 'Polish',
        order: 6,
      },
    },
    po: {
      fr: {
        label: 'French',
        order: 0,
      },
      de: {
        label: 'German',
        order: 2,
      },
      es: {
        label: 'Spanish',
        order: 3,
      },
      nl: {
        label: 'Dutch',
        order: 5,
      },
    },
    mrv: {
      fr: {
        label: 'French',
        order: 0,
      },
    },
    assetregister: {
      en_GB: {
        label: 'English',
        order: 0,
      },
      // fr: {
      //   label: 'French',
      //   order: 1,
      // },
    },
  },
  // order to sort docs
  lang_order: {
    // Multi-databases:
    default: ['fr', 'en', 'de', 'es', 'it', 'nl', 'pl'],
    po: ['fr', 'de', 'es', 'nl'],
    mrv: ['fr'],
    assetregister: ['en_GB' /*, 'fr'*/],
  },
  flat_collection: true, // process.env.FLAT_COLLECTION === 'true', // ### => false | true
}

export default config
