// Utils
const {
  Validations: { validateSchema },
} = require('@utils/Validations')

const SchemaCategoryCreation = {
  name: {
    type: String,
    required: "You must provide a field: 'name'",
  },
  emptyBody: "You need to provide the product fields: 'name', 'description', etc.",
}

const validateCategoryCreation = validateSchema(SchemaCategoryCreation)

// Crear una categoría
module.exports = function createCategory(Model) {
  return async (req, res) => {
    try {
      // Validar el body
      const body = validateCategoryCreation(req.body)

      // Si existen errores en el body, devolver errores
      if (body.error) throw new Error(body.error)

      // Obtener el nombre de la categoría a crear
      const categoryName = req.body.name

      // Comprobar si existe una categoría con nombre repetido
      const existCategory = await Model.exists({ name: categoryName })

      // Enviar mensaje de error por categoría duplicada
      if (existCategory) {
        throw new Error(`Ya existe la categoría '${categoryName}'`)
      }

      // Crear nueva categoría
      const newCategory = new Model({ name: categoryName })

      // Guardar categoría
      await newCategory.save()

      // Mensaje existoso
      return res.json({
        newCategory: newCategory,
        message: `Se ha creado la categoría '${categoryName}' existosamente`
      })
    } catch (err) {
      return res.status(400).send({ error: err.message })
    }
  }
}