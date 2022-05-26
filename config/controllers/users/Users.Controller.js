// Models
const User = require('@models/users/User')
const Role = require('@models/users/Role')
const Admin = require('@models/users/Admin')

// Middlewares
const { removeImageFromCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { comparePassword, encryptPassword } = require('@utils/Helper')
const { isString, isFunction, isEmptyObject } = require('@utils/Validations')

// Editar un usuario por id
exports.editUser = function(messages) {
  return async (req, res, next) => {
    try {
      // Obtener datos del body
      const { fullname, email, role } = req.body

      // Encontrar si ya existe un admin con ese correo electrónico
      const existAdminWithThatEmail = await Admin.exists({ email })

      // Comprobar si el correo ingresado, no es igual al del admin
      if (existAdminWithThatEmail) {
        throw new Error('Ya existe un usuario registrado con ese correo electrónico')
      }

      // Obtener id de usuario
      const { userId } = req.params

      // Encontrar al usuario que se va a editar
      const existUser = await User.exists({ _id: userId })

      // Si el usuario no existe
      if (!existUser) {
        throw new Error(`No se ha encontrado al usuario ${fullname} para editar su información`)
      }

      const formHasBeenEdited = JSON.parse(req.body.formHasBeenEdited);

      // Si la información del usuario sigue siendo la misma
      if (!formHasBeenEdited) {
        throw new Error(messages.errors.userDataIsTheSame)
      }

      // Encontrar el rol del usuario
      const roleFound = await Role.findOne({ name: role }).select({ id: 1 }).lean()

      // Nueva información del usuario
      const newUserData = {
        email: email,
        fullname: fullname,
        role: roleFound._id,
      }

      const existUserPhoto = JSON.parse(req.body.existUserPhoto)

      // Si se ha eliminado la foto del usuario
      if (!existUserPhoto) {
        // Obtener el id de la imagen de Cloudinary que se va a eliminar
        const public_id = `users/user-${userId}`;

        // Eliminar imagen de Cloudinary
        await removeImageFromCloudinary(public_id);

        // Eliminar foto de perfil del usuario de la DB
        Object.assign(newUserData, {
          profilePhoto: {}
        })
      }

      // Actualizar usuario
      await User.findByIdAndUpdate(userId, newUserData)

      // Mensaje existoso
      const successMessage = isFunction(messages.successMessage)
        ? messages.successMessage(req.body)
          : isString(messages.successMessage)
            ? messages.successMessage
            : null;

      // Setear id de usuario
      req.fileId = userId

      // Si existe una imagen como archivo
      if (req.file) {
        // Setear mensaje exitoso
        req.successMessage = successMessage

        // Continuar al siguiente middleware
        return next();
      }

      // Retornar mensaje exitoso
      return res.status(200).json({ message: successMessage });
    } catch (err) {
      if (err.codeName === 'DuplicateKey') {
        return res.status(400).send({
          error: 'Ya existe un usuario registrado con ese correo electrónico'
        });
      }

      return res.status(400).send({ error: err.message });
    }
  }
}

// Eliminar un usuario por id
exports.deleteUser = async function(req, res) {
  try {
    let account = null;
    // Obtener id del usuario
    const { userId } = req.params

    // Si se debe eliminar definitivamente la cuenta
    if (req.query.status === 'close account') {
      account = await User.findByIdAndDelete(userId)
    } else {
      // Se actualiza el usuario a usuario eliminado, su cuenta aún sigue estando disponible
      account = await User.findByIdAndUpdate(userId, {
        deleted: true,
        deletedAt: new Date().toISOString(),
      })
    }

    // Si el usuario tiene foto de perfil
    if (account.profilePhoto && !isEmptyObject(account.profilePhoto)) {
      // Eliminar foto de perfil del usuario de Cloudinary
      await removeImageFromCloudinary(account._id)
    }

    // Retornar respuesta del servidor
    return res.status(204).json({})
  } catch (error) {
    return res.status(400).send({ error: error.message })
  }
}

// Restaurar un usuario por id
exports.restoreUser = async function(req, res) {
  try {
    const { userId } = req.params

    const { username } = req.body

    if (!userId) {
      if (!username) {
        throw new Error('A ocurrido un error para restaurar al usuario')
      }

      throw new Error(`A ocurrido un error inesperado a la hora de restaurar al usuario ${username}`)
    }

    // Si se debe eliminar definitivamente la cuenta
    await User.findByIdAndUpdate(userId, {
      deleted: false,
      $unset: { deletedAt: '' },
    })

    // Retornar respuesta del servidor
    return res.status(204).json({});
  } catch (error) {
    res.status(400).send({ error: error.message })
  }
}

// Actualizar contraseña de usuario
exports.changePassword = async function(req, res) {
  try {
    const { password, newPassword } = req.body

    // Buscar un usuario
    const user = await User.findOne({ _id: req.params.userId }).select('password').lean()

    // Comparar contraseñas para comprobar si son iguales
    const matchPassword = await comparePassword(password, user.password)

    // Si la contraseña no es igual a la contraseña del usuario encontrado
    if (!matchPassword) {
      throw new Error('La contraseña que has ingresado, no coincide con la tuya')
    }

    // Si la nueva contraseña es igual a la actual contraseña del admin
    if (password === newPassword) {
      throw new Error('La nueva contraseña no debe ser igual a tu actual contraseña')
    }

    const filter = { _id: user._id }
    const encryptNewPassword = await encryptPassword(newPassword)

    // Actualizar la contraseña del Administrador
    await User.findOneAndUpdate(filter, {
      password: encryptNewPassword
    })

    // Retornar respuesta del servidor
    return res.status(204).json({})
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}
