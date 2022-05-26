// Authentication
const auth = require('./auth/_exports')

// Roles
const roles = require('./roles')

// Users
const users = require('./users')

// User admin
const userAdmin = require('./admin')

// Testimonials
const testimonials = require('./testimonials')

// Products
const seytuProducts = require('./products/seytu')
const omnilifeProducts = require('./products/omnilife')

// Contact
const contact = require('./contact')

module.exports = function(app) {
  app.use('/api/auth/', auth)
  app.use('/api/roles/', roles)
  app.use('/api/users/', users)
  app.use('/api/admin/', userAdmin)
  app.use('/api/contact/', contact)
  app.use('/api/testimonials/', testimonials)
  app.use('/api/products/seytu/', seytuProducts)
  app.use('/api/products/omnilife/', omnilifeProducts)
}
