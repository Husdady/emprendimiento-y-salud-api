// Utils
const { SchemaProductCreation } = require('@utils/schemas')
const { isEmptyArray, Validations } = require('@utils/Validations')

const validateProductCreation = Validations.validateSchema(SchemaProductCreation)

// Crear un producto
module.exports = function createProduct(Model) {
  return async (req, res, next) => {
    try {
      // Validar el body
      const body = validateProductCreation(req.body)
      // Si existen errores en el body, devolver errores
      if (body.error) throw new Error(body.error)

      const {
        name,
        description,
        price,
        stock,
        content,
        benefits,
        categories,
        usageMode
      } = req.body

      // Crear nuevo usuario
      const newProduct = new Model({
        name: name,
        content: content,
        usageMode: usageMode,
        description: description,
        price: JSON.parse(price),
        stock: JSON.parse(stock),
        benefits: JSON.parse(benefits),
        categories: JSON.parse(categories),
        initialName: name.toLowerCase().replace(/\s/gim, '-')
      })

      // Guardar producto
      await newProduct.save();

      // Mensaje existoso
      const successMessage = "Se ha creado un nuevo producto exitosamente!"

      req.successMessage = successMessage;

      // Continuar al siguiente middleware
      if (isEmptyArray(req.files)) {
        // Retornar mensaje exitoso
        return res.status(200).json({ message: successMessage });
      }

      // Obtener imágenes del producto
      const images = JSON.parse(req.body.images);

      // Obtener las imágenes nuevas del producto
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

      req.id = newProduct._id;
      req.item = newProduct;
      req.images = productImages;

      // Continuar al siguiente middleware
      return next();
    } catch (error) {
      return res.status(400).send({ error: error.message })
    }
  }
}
