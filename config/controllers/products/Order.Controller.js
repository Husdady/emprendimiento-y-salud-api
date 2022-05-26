// Middlewares
const createOrder = require("@middlewares/orders/createOrder")
const deleteClient = require("@middlewares/orders/deleteClient")
const changeOrderStatus = require("@middlewares/orders/changeOrderStatus")
const deleteProductOrder = require("@middlewares/orders/deleteProductOrder")
const getTotalClientOrders = require("@middlewares/orders/getTotalClientOrders")

module.exports = {
  createOrder,
  changeOrderStatus,
  deleteProductOrder,
  deleteClient,
  getTotalClientOrders,
}
