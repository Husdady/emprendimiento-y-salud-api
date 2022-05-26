// Utils
const { isEmptyArray } = require('@utils/Validations');

// Obtener el total de pedidos realizados por un cliente
module.exports = function getTotalClientOrders(Model) {
  return async (req, res, next) => {
    try {
      const productsOrders = await Model.aggregate([
        { $unwind: "$clientProducts" },
        { $match: { clientId: req.params.clientId }},
        { $group: { _id: null, totalOrders: { $sum: 1 } }}
      ])

      const totalOrders = isEmptyArray(productsOrders) ? 0 : productsOrders[0].totalOrders

      // Retornar respuesta del servidor
      return res.status(200).json({
        totalOrders: totalOrders
      })
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
  }
}