// Models
const User = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Utils
const { Validations } = require('@utils/Validations')
const { comparePassword, createToken } = require('@utils/Helper')

// Inicio de sesión
module.exports = async function signIn(req, res) {
  try {
    // Obtener el correo y la contraseña del usuario 
    const { email, password } = req.body

    const fields = { deletedAt: 0, updatedAt: 0, deleted: 0 }

    // Encontrar al admin o a un usuario por correo
    const userFounds = await Promise.all([
      User.findOne({ email }).populate('role', { name: 1 }).select(fields),
      Admin.findOne({ email }).select({ ...fields, role: { permissions: 0 } }),
    ])

    // Encontrar un válido usuario
    const userFound = userFounds.find((user) => !!user)

    // Comprobar si existe un usuario
    if (!userFound) throw new Error('El correo electrónico que has ingresado no existe')

    // Comparar contraseñas para comprobar si son iguales
    const matchPassword = await comparePassword(password, userFound.password)

    // Si la contraseña no es correcta
    if (!matchPassword) throw new Error('Contraseña incorrecta')

    // Comprobar si no es un usuario eliminado
    if (userFound.deleted) {
      throw new Error('Tu cuenta ha sido eliminada')
    }
    
    // Comprobar si un usuario a validado su correo electrónico
    if (!userFound.verifiedEmail) {
      throw new Error('Necesitas verificar tu correo electrónico para poder ingresar!')
    }

    // Segundos que hay en un día
    const daySeconds = 86400

    // Crear token de usuario
    const token = createToken({
      secretType: 'login',
      exp: daySeconds * 3,
      data: { id: userFound._id },
    })
    
    // Comprobar si existe la clave secreta
    return Validations.validateSecretPassword({
      secret_password: req.headers.secret_password,
      onEqual: function() {
        return res.status(200).json({
          user: {
            access_token: token,
            _id: userFound._id,
            fullname: userFound.fullname,
            email: userFound.email,
            role: userFound.role.name,
            secretKey: userFound.secretKey,
            createdAt: userFound.createdAt,
            profilePhoto: {
              url: userFound.profilePhoto?.url,
            },
          }
        })
      },
      onDifferent: function() {
        return res.status(401).json({
          user: {},
          status: 'processing',
          error: 'Ha ocurrido una falla en nuestro sistema'
        })
      }
    })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}
