// Queries
const RoleQuery = require('./users/Role.Query')
const UserQuery = require('./users/User.Query')
const ContactQuery = require('./contact/Contact.Query')
const TestimonyQuery = require('./testimonials/Testimony.Query')

// Seytu Queries
const SeytuOrdersQuery = require('./products/SeytuOrders.Query')
const SeytuProductsQuery = require('./products/SeytuProducts.Query')
const SeytuCategoriesQuery = require('./products/SeytuCategories.Query')

// Omnilife Queries
const OmnilifeOrdersQuery = require('./products/OmnilifeOrders.Query')
const OmnilifeProductsQuery = require('./products/OmnilifeProducts.Query')
const OmnilifeCategoriesQuery = require('./products/OmnilifeCategories.Query')

module.exports = {
  ...RoleQuery,
  ...UserQuery,
  ...ContactQuery,
  ...TestimonyQuery,
  ...SeytuOrdersQuery,
  ...SeytuProductsQuery,
  ...SeytuCategoriesQuery,
  ...OmnilifeOrdersQuery,
  ...OmnilifeProductsQuery,
  ...OmnilifeCategoriesQuery,
}