// Models
const Users = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Utils
const { isEmptyObject } = require('@utils/Validations')

// Verificar cuenta de un usuario
exports.verifyAccount = async function(req, res) {
  const { userEmail, accountType, confirmationCode } = req.body

  const models = {
  	user: Users,
  	admin: Admin,
  }

  try {
    // Si no existe el tipo de cuenta 'user' o 'admin'
	  if (!models[accountType]) {
	  	return res.status(403).json({ error: 'Tipo de cuenta inválida' })
	  }

	  const currentModel = models[accountType];

	  // Encontrar un usuario por 'email' y 'confirmationCode'
	  const userFound = await currentModel.findOne({
	  	email: userEmail,
	  	confirmationCode: confirmationCode,
	  })
	  	.select({ verifiedEmail: 1 })

	  // Si no se ha encontrado un usuario
	  if (!userFound) {
	  	return res.status(403).json({ error: 'Usuario no encontrado' })
	  }

	  // Si el correo electrónico ya ha sido verificado
	  if (userFound.verifiedEmail) {
	  	return res.status(404).json({ status: 'EmailAlreadyVerified', error: 'Cuenta de usuario ya verificada' })
	  }

	  // Verificar email y guardar cambios
	  userFound.verifiedEmail = true
	  await userFound.save()

	  return res.status(201).json({})
  } catch(error) {
    return res.status(401).json({ error: error.message })
  }
}

// Cerrar cuenta de usuario
exports.closeMyAccount = async function(req, res) {
  const { userId, accountType } = req.body

  const models = {
    user: Users,
    admin: Admin,
  }

  try {
    // Si no existe el tipo de cuenta 'user' o 'admin'
    if (!models[accountType]) {
      return res.status(403).json({ error: 'Tipo de cuenta inválida' })
    }

    const fields = { _id: 0, profilePhoto: 1 }
    const currentModel = models[accountType];

    // Eliminar usuario
    const user = await currentModel.findByIdAndDelete(userId).select(fields)

    if (!user) {
      return res.status(400).json({
        error: 'No puedes eliminar a un usuario que no existe'
      })
    }

    // Si el usuario tiene foto de perfil
    if (user.profilePhoto && !isEmptyObject(user.profilePhoto)) {
      const public_id = user.profilePhoto.cloudinary_path

      // Eliminar foto de perfil del usuario de Cloudinary
      await removeImageFromCloudinary(public_id)
    }
    
    // Retornar respuesta del servidor
    return res.status(204).json({})
  } catch (error) {
    return res.status(400).send({ error: error.message })
  }
}
