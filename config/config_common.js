export default {
  env: 'dev',
  db: {
    mongodb: process.env.MONGODB_URL || 'mongodb://localhost/honodb'
  },
  langs: {
    'fr': { 'label': 'Français',
    'order': 0},
    'en': { 'label': 'Anglais',
    'order': 1}
  }
}
