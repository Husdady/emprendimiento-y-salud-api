// Middlewares
const { uploadImageToCloudinary } = require('./Upload.Cloudinary')

// Utils
const { isFunction, isEmptyArray } = require('@utils/Validations')
const { getSomeFieldsFromCloudinaryImage } = require('@utils/Helper')

// Subir imagen a la DB
exports.uploadImage = function(settings) {
  return async (req, res) => {
    try {
      // Obtener ajustes
      const { path, Model, uploadError } = settings;

      // Setear imagen que se va a subir a la Base de Datos
      const image = {
        $set: {
          [path]: getSomeFieldsFromCloudinaryImage(req.cloudinaryImage)
        },
      }

      // Actualizar imagen en Modelo
      const uploadedImage = await Model.findByIdAndUpdate(req.id, image, { new: true }).select(path)

      // Setear respuesta del servidor
      const response = {
        message: req.successMessage,
        uploadedImage: uploadedImage,
      }

      // Retornar mensaje
      return res.status(200).json(response)
    } catch (error) {
      return res.status(400).send({ error: error.message  || uploadError })
    }
  }
}

// Subir múltiples imágenes de Cloudinary
exports.uploadMultipleImages = function(settings) {
  return async (req, res) => {
    try {
      // Obtener ajustes
      const { path, Model, extraFields, uploadError } = settings;

      const extraData = isFunction(extraFields) ? extraFields(req.uploadImages) : {}

      // Setear imagen que se va a subir a la Base de Datos
      const images = {
        $set: {
          [path]: req.uploadImages,
          ...extraData,
        },
      }

      await Model.findByIdAndUpdate(req.id, images)

      // Retornar mensaje exitoso
      return res.status(200).json({ message: req.successMessage });
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
  }
}
