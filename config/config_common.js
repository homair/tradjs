export default {
  env: 'dev',
  db: {
    mongodb: process.env.MONGODB_URL || 'mongodb://localhost/honodb'
  }
}
