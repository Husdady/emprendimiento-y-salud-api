// Models
const User = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Middlewares
const { removeImageFromCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { comparePassword, encryptPassword } = require('@utils/Helper')

// Comprobar si existe un usuario administrador
exports.existUserAdmin = async function(_, res) {
  try {
    // Obtener el total de admins
    const adminCount = await Admin.estimatedDocumentCount()

    // Si el total de admins es mayor a 0
    if (adminCount > 0) {
      return res.status(200).json({ existUserAdmin: true });
    }
    
    return res.status(200).json({ existUserAdmin: false });
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}

// Actualizar información personal del usuario administrador
exports.updateMyPersonalInformation = async function(req, res, next) {
  try {
    // Setear id del usuario administrador
    const { adminId } = req.query

    // Obtener datos del body
    const { fullname, email, profilePhotoName } = req.body
    
    // Encontrar si ya existe un usuario con ese correo electrónico
    const existUserWithThatEmail = await User.exists({ email })

    // Comprobar si el correo ingresado no está en uso
    if (existUserWithThatEmail) {
      throw new Error('Ya existe un usuario registrado con ese correo electrónico')
    }

    const formHasBeenEdited = JSON.parse(req.body.formHasBeenEdited)

    // Si la información del usuario sigue siendo la misma
    if (!formHasBeenEdited) {
      throw new Error('Tu información es la misma, debes proporcionar nuevos datos')
    }

    // Nueva información del usuario
    const newAdminData = {
      fullname: fullname,
      email: email,
    }

    const existUserPhoto = JSON.parse(req.body.existUserPhoto)

    if (!existUserPhoto) {
      // Obtener el id de la imagen de Cloudinary que se va a eliminar
      const public_id = `admin/admin-${adminId}`;

      // Eliminar imagen de Cloudinary
      await removeImageFromCloudinary(public_id);

      // Eliminar foto de perfil del usuario de la DB
      Object.assign(newAdminData, {
        settings: {
          avatar: null,
        },
      })
    }

    // Actualizar usuario administrador
    await Admin.findOneAndUpdate({}, newAdminData)

    // Mensaje existoso
    const successMessage = "Se actualizó tu información personal exitosamente"

    // Setear id de usuario
    req.fileId = adminId

    // Si existe una imagen como archivo
    if (req.file) {
      // Setear mensaje exitoso
      req.successMessage = successMessage

      // Continuar al siguiente middleware
      next();
    }

    // Retornar mensaje exitoso
    return res.status(200).json({ message: successMessage })
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      return res.status(400).send({ error: 'Ya existe un usuario registrado con ese correo electrónico' })
    }

    return res.status(400).send({ error: err.message });
  }
}

// Actualizar contraseña del usuario administrador
exports.changePassword = async function(req, res) {
  try {
    const { password, newPassword } = req.body

    // Seleccionar al usuario admin
    const admin = await Admin.findOne({}).select('password').lean()

    // Comparar contraseñas para comprobar si son iguales
    const matchPassword = await comparePassword(password, admin.password)

    // Si la contraseña no es igual a la contraseña del admin
    if (!matchPassword) {
      throw new Error('La contraseña que has ingresado, no coincide con la tuya')
    }

    // Si la nueva contraseña es igual a la actual contraseña del admin
    if (password === newPassword) {
      throw new Error('La nueva contraseña no debe ser igual a tu actual contraseña')
    }

    // Actualizar la contraseña del Administrador
    await Admin.findOneAndUpdate({}, {
      password: await encryptPassword(newPassword)
    })

    return res.status(204).json({})
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}

// Cerrar cuenta del usuario administrador
exports.closeMyAccount = async function(req, res) {
  try {
    // Eliminar usuario administrador
    const admin = await Admin.findByIdAndDelete(req.params.userId)

    // Si el usuario administrador tiene foto de perfil
    if (admin?.settings?.avatar) {
      await removeImageFromCloudinary(admin._id);
    }
    
    return res.status(204).json({});
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
}
