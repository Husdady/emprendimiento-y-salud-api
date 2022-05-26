'use strict'

const helmet = require('helmet')

module.exports = function(app) {
  app.use(
    helmet({
      contentSecurityPolicy: process.env.NODE_ENV === 'production',
    }),
  )
}
