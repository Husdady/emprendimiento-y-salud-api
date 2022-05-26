const mongoose = require('mongoose')

const DB_CONNECTION = process.env.DB_CONNECTION || '#'

const Schema = mongoose.Schema

mongoose
  .connect(DB_CONNECTION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('[DB CONNECTED]', 'The database is connected'))
  .catch((error) => console.log('[ERROR]', 'An error occurred connecting to the database:', error))

module.exports = { mongoose, Schema }
