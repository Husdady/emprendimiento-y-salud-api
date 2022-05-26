// Services
const cloudinary = require('@services/cloudinary')

// Utils
const { isFunction, isEmptyArray } = require('@utils/Validations')
const { getSomeFieldsFromCloudinaryImage } = require('@utils/Helper')

// Subir imagen a Cloudinary
exports.uploadImageToCloudinary = function(callback) {
  return async (req, res, next) => {
    try {
      // Obtener configuración de subida de imagen a Cloudinary
      const config = isFunction(callback) ? callback(req.fileId) : {}

      // Subir imagen
      const cloudinaryImage = await cloudinary.v2.uploader.upload(req.file.path, config)

      // Asignar 'filename' y 'public_id' a la imagen subida en Cloudinary
      Object.assign(cloudinaryImage, {
        filename: req.file.filename,
        cloudinary_path: cloudinaryImage.public_id,
      })

      req.id = req.fileId
      req.cloudinaryImage = cloudinaryImage

      // Continuar al siguiente middleware
      return next();
    } catch(error) {
      const defaultErrorMessage = "A ocurrido un error al subir la imagen a Cloudinary"
      return res.status(400).send({ error: error.message || defaultErrorMessage })
    }
  }
}

// Subir múltiples imágenes a Cloudinary
exports.uploadMultipleImagesToCloudinary = function(callback) {
  return async (req, res, next) => {
    try {
      // Obtener folder en el que se va ubicar la imagen subida a Cloudinary
      const folder = isFunction(callback) ? callback(req.item) : {}

      const uploadImages = [];
      const images = req.images;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        // Si la imagen no tiene la propiedad "path", es porque es una imagen existente
        if (!image.path) {
          uploadImages.push(image)
          continue;
        }

        // Setear configuración de Cloudinary 
        const config = {
          folder: folder,
          public_id: image.public_id,
          filename: image.filename,
        }

        // Subir imagen a Cloudinary
        const newCloudinaryImage = await cloudinary.v2.uploader.upload(image.path, config);
        
        // Comprobar si no hay algún error al subir una imagen a Cloudinary
        if (newCloudinaryImage instanceof Error) {
          throw new new Error(newCloudinaryImage.error)
        }

        // Asignar 'filename' y 'public_id' a la imagen subida en Cloudinary
        Object.assign(newCloudinaryImage, {
          filename: image.filename,
          cloudinary_path: newCloudinaryImage.public_id,
        })

        // Obtener algunos campos de la imagen subida a Cloudinary 
        const newUploadImage = getSomeFieldsFromCloudinaryImage(newCloudinaryImage);

        // Agregar imagen
        uploadImages.push(newUploadImage);
      }

      // Setear las imágenes que se han subido
      req.uploadImages = uploadImages

      // Continuar al siguiente middleware
      return next();
    } catch(error) {
      return res.status(400).send({ error: error.message })
    }
  }
}

// Eliminar imagen de Cloudinary
exports.removeImageFromCloudinary = async function(public_id) {
  console.log('[removeImageFromCloudinary]')
  return new Promise((resolve) => {
    cloudinary.v2.uploader.destroy(public_id, (err, res) => {
      console.log('[removeImageFromCloudinary.err]', err)
      if (err) throw new Error("A ocurrido un error al eliminar la imagen de Cloudinary");
      resolve(res);
    })
  })
}

// Eliminar carpeta de Cloudinary
exports.removeFolderFromCloudinary = async function(folder) {
  console.log('[removeFolderFromCloudinary]')
  return new Promise((resolve) => {
    cloudinary.v2.api.delete_folder(folder, (err, res) => {
      console.log('[removeFolderFromCloudinary.err]', err)
      if (err) throw new Error(`A ocurrido un error al eliminar la carpeta "${folder}" de Cloudinary`)
      resolve(res)
    })
  })
}
