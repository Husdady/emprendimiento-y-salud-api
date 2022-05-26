// Eliminar cliente que realizó un pedido
module.exports = function deleteClient(Model) {
  return async (req, res) => {
    try {
      // Obtener id del producto
    	const { clientId } = req.params;

    	// Eliminar cliente
      const deletedClient = await Model.findByIdAndDelete(clientId);

      // Retornar mensaje exitoso
      return res.status(200).json({
      	message: `El cliente ${deletedClient.clientName} ha sido eliminado`
      })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }
}