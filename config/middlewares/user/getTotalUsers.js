// Models
const User = require('@models/users/User')

// Utils
const { isEmptyArray } = require('@utils/Validations');

// Obtener el total de usuarios
module.exports = async function getTotalUsers(req, res) {
  try {
    const { filters } = req.query;
    const totalUsers = await User.count(JSON.parse(filters));

    // Retornar respuesta del servidor
    return res.status(200).json({
      totalUsers: totalUsers
    })
  } catch (error) {
    return res.status(400).send({ error: error.message })
  }
}
