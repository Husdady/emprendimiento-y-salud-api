// Middlewares
const editProduct = require("@middlewares/products/editProduct")
const createProduct = require("@middlewares/products/createProduct")
const deleteProduct = require("@middlewares/products/deleteProduct")

module.exports = {
  editProduct,
  createProduct,
  deleteProduct,
}
