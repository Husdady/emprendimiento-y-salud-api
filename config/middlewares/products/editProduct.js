// Middlewares
const { removeImageFromCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { isEmptyArray } = require('@utils/Validations');

// Editar producto
module.exports = function editProduct(Model) {
  return async (req, res, next) => {
    try {
      const {
        name,
        description,
        price,
        stock,
        content,
        benefits,
        categories,
        usageMode,
      } = req.body;

      const formHasBeenEdited = JSON.parse(req.body.formHasBeenEdited);

      // Si la información del producto sigue siendo la misma
      if (!formHasBeenEdited) {
        throw new Error("La información del producto es la misma, por favor actualice su información")
      }

      const { productId } = req.params;
      const images = JSON.parse(req.body.images);
      
      // Nueva información del producto
      const newProductData = {
        name: name,
        content: content,
        usageMode: usageMode,
        description: description,
        price: JSON.parse(price),
        stock: JSON.parse(stock),
        benefits: JSON.parse(benefits),
        categories: JSON.parse(categories),
      }

      // Obtener información anterior del Producto
      const lastProductData = await Model.findById(productId).select({
        name: 1,
        initialName: 1,
        images: {
          _id: 1,
          url: 1,
          size: 1,
          width: 1,
          height: 1,
          format: 1,
          filename: 1,
          public_id: 1,
          cloudinary_path: 1,
          created_at: 1,
        }
      });

      const lastProductImages = lastProductData.images;
      const existDeletedImages = images.length < lastProductImages.length;

      // Mensaje existoso
      const successMessage =  `Se ha actualizado exitosamente el producto exitosamente '${lastProductData.name}'`;

       // Setear mensaje exitoso
      req.successMessage = successMessage

      // Si no se han (agregado|editado|eliminado) imágenes del producto
      if (isEmptyArray(req.files) && !existDeletedImages) {
        // Actualizar sólo la información del producto
        await Model.findByIdAndUpdate(productId, newProductData);

        // Retornar mensaje exitoso
        return res.status(200).json({ message: successMessage });
      }

      // Comprobar si se han eliminado imágenes del producto
      if (existDeletedImages) {
        // Obtener imágenes eliminadas del producto
        const deletedProductImages = lastProductImages.filter((lastProductImage) => {
          return !images.find(image => image.public_id === lastProductImage.public_id);
        });

        for (const deletedProductImage of deletedProductImages) {
          // Obtener el 'public_id' de cada imagen eliminada
          const public_id = deletedProductImage.cloudinary_path;

          // Eliminar imagen de Cloudinary
          const removedImage = await removeImageFromCloudinary(public_id);

          // Si hay algún error al eliminar una imagen
          if (removedImage instanceof Error) {
            throw new new Error(removedImage.error)
          }
        }

        // Obtener imágenes del producto que no se han eliminado
        const remainingProductImages = lastProductImages.filter(lastProductImage => {
          return !deletedProductImages.find(deletedProductImage => deletedProductImage.public_id === lastProductImage.public_id)
        })

        const config = { multi: true }
        const filter = { _id: productId }
        const $pullAll = {
          defaultImage: remainingProductImages[0],
          $pullAll: {
            images: deletedProductImages
          },
        }

        await Model.updateOne(filter, $pullAll, config);

        // Retornar mensaje exitoso
        return res.status(200).json({ message: successMessage });
      }

      // Obtener las imágenes actualizadas del producto
      const productImages = images.map(image => {
        const existFile = req.files.find(file => file.filename === image.filename);

        if (existFile) {
          return {
            ...image,
            path: existFile.path
          }
        }

        return image;
      })

      req.id = productId;
      req.item = lastProductData;
      req.images = productImages;

      // Continuar al siguiente middleware
      return next();
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
  }
}