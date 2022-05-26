// Editar una categoría
module.exports = function editCategory(Model) {
  return async (req, res) => {
    try {
      // Obtener categoría en body
      const {
        newCategoryName,
        lastCategoryName,
        categoryHasBeenEdited
      } = req.body

      // Si el nombre de la categoría no ha sido editado
      if (!categoryHasBeenEdited) {
        throw new Error('El nombre de la categoría sigue siendo el mismo')
      }

      // Actualizar rol
      await Model.findByIdAndUpdate(req.params.categoryId, {
        name: newCategoryName,
      })

      // Retornar respuesta de servidor
      res.status(200).json({
        message: `Se actualizó exitosamente la categoría '${lastCategoryName}'`,
      })
    } catch (err) {
      if (err.codeName === 'DuplicateKey') {
        res.status(400).send({
          error: 'Ya existe una categoría registrada con ese nombre',
        })
      } else {
        res.status(400).send({ error: err.message })
      }
    }
  }
}