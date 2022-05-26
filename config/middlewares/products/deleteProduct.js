// Middlewares
const {
  removeImageFromCloudinary,
  removeFolderFromCloudinary
} = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { isFunction, isEmptyArray } = require('@utils/Validations');

// Eliminar producto
module.exports = function deleteProduct(Model, callback) {
  return async (req, res) => {
    try {
    	// Obtener id del producto
    	const { productId } = req.params;

      const deletedProduct = await Model.findByIdAndDelete(productId);

      // Si el producto no tiene imágenes
      if (isEmptyArray(deletedProduct.images)) {
        // Retornar respuesta de servidor
        return res.status(204).json({})
      }

      // Obtener el nombre de la carpeta de Cloudinary
      const folder = isFunction(callback) ? callback(deletedProduct) : "";

      for (let image of deletedProduct.images) {
      	// Obtener el "public_id" de cada imagen del producto eliminado
        const public_id = image.cloudinary_path;

        if (!public_id) continue;

        // Eliminar imagen de Cloudinary
      	const removedImage = await removeImageFromCloudinary(public_id)

	      if (removedImage instanceof Error) {
	      	throw new Error(removedImage.error);
	      }
      }

      // Eliminar carpeta de Cloudinary
      const removedFolder = await removeFolderFromCloudinary(folder)

      if (removedFolder instanceof Error) {
      	throw new Error(removedFolder.error);
      }

      // Retornar respuesta de servidor
      return res.status(204).json({})
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
  }
}