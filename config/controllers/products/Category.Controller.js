// Middlewares
const createCategory = require("@middlewares/categories/createCategory")
const editCategory = require("@middlewares/categories/editCategory")
const deleteCategory = require("@middlewares/categories/deleteCategory")

module.exports = {
  createCategory,
  editCategory,
  deleteCategory,
}
