// Eliminar una categoría
module.exports = function deleteCategory(Model, Company) {
  return async (req, res) => {
    try {
      const { categoryId } = req.params

      // Eliminar categoría
      await Model.findByIdAndDelete(categoryId)

      // Filtros
      const filter = {
        categories: {
          $in: categoryId,
        },
      };

      // Actualización
      const $pullAll = {
        $pullAll: {
          categories: [categoryId],
        },
      }

      // Configuración extra
      const extraConfig = { multi: true }

      // Eliminar categoría en productos
      await Company.updateMany(filter, $pullAll, extraConfig)

      // Retornar respuesta de servidor
      return res.status(204).json({});
    } catch (err) {
      return res.status(400).send({ error: err.message })
    }
  }
}