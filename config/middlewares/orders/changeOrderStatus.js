// Middlewares
const {
  removeImageFromCloudinary,
  removeFolderFromCloudinary
} = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { isFunction, isEmptyArray } = require('@utils/Validations');

// Cambiar el estado del pedido del cliente
module.exports = function changeOrderStatus(Model) {
  return (status) => {
    return async (req, res) => {
      try {
        // Filtro
        const filter = {
          clientId: req.params.clientId,
          clientProducts: {
            $elemMatch: { product: req.params.productId }
          }
        }

        // Actualización
        const update = {
          $set: {
            "clientProducts.$.status": status
          }
        }

        // Configuración extra
        const extraConfig = {
          new: true,
          safe: true,
          upsert: true,
        }

        // Actualizar estado del pedido a "cancelado"
        await Model.findOneAndUpdate(filter, update, extraConfig);

        let successMessage = {}

        switch (status) {
          case "cancelled":
            Object.assign(successMessage, {
              message: "El pedido ha sido cancelado"
            });

            break;

          case "completed":
            Object.assign(successMessage, {
              message: "El pedido ha sido completado satisfactoriamente"
            });
            
            break;

          default:
            break;
        }

        return res.status(200).json(successMessage)
        // {
        //   message: "El pedido ha sido cancelado"
        // });
      } catch (error) {
        return res.status(400).send({ error: error.message })
      }
    }
  }
}