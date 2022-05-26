// Eliminar pedido de un producto
module.exports = function deleteProductOrder(Model) {
  return async (req, res) => {
    try {
      // Obtener id del producto
    	const { clientId, orderId } = req.params;

      // Filtros
      const filter = {
      	clientId: clientId,
      };

      // Actualización
      const $pull = {
        $pull: {
          clientProducts: {
            _id: orderId
          }
        },
      }

      // Configuración extra
      const extraConfig = {
        // multi: true
        safe: true,
        upsert: true,
      }

      // Eliminar pedido de un producto realizado por un cliente
      await Model.updateMany(filter, $pull, extraConfig)

      // Retornar respuesta de servidor
      return res.status(204).json({});
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}