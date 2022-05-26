// Librarys
const jwt = require('jsonwebtoken')

// Models
const User = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Comprobar si existe el token
exports.verifyToken = async function(req, res, next) {
  try {
    // Obtener queries
    const { skipNextMiddleware } = req.body

    // Comprobar si se debe saltar el siguiente middleware
    if (skipNextMiddleware) {
      // Saltar el siguiente middleware
      return next()
    }

    // Comprobar si existe un header de autorización
    if (!req.headers['authorization']) throw new Error('No estás autorizado para realizar esta operación!')
    const token = req.headers['authorization'].split(' ')[1]

    // Comprobar si existe un token
    if (!token) throw new Error('No tienes permisos suficientes!')

    // Descifrar token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_LOGIN)
    
    // Obtener id de usuario proveniente del token
    const userId = decodedToken.id

    // Buscar usuarios
    const userFounds = await Promise.all([
      Admin.findById(userId, { _id: 0, role: { name: 1 } }),
      User.findById(userId, { _id: 0, role: 1 }).populate({
        path: 'role',
        select: {
          _id: 0,
          name: 1,
        },
      }),
    ])

    // Verificar si se encontró un usuario
    const userFound = userFounds.find((user) => user !== null)
    if (!userFound) throw new Error('Usuario no encontrado!')

    req.userRole = userFound.role.name
    
    // Continuar al siguiente middleware
    return next();
  } catch (error) {
    return res.status(401).send({ error: error.message })
  }
}

// Comprobar si es un token válido
exports.isValidToken = function({ secretType }) {
  return (req, res) => {
    try {
      // Comprobar si existe un header de autorización
      if (!req.headers['authorization']) throw new Error('You need to provide a "token"')
      const token = req.headers['authorization'].split(' ')[1]

      // Comprobar si existe un token
      if (!token) throw new Error('You need to provide a valid "token".')

      const secrets = {
        login: process.env.JWT_SECRET_LOGIN,
        forgotPassword: process.env.JWT_SECRET_FORGOT_PASSWORD,
        emailConfirmation: process.env.JWT_SECRET_EMAIL_CONFIRMATION,
      }

      // Verificar token
      jwt.verify(token, secrets[secretType], function(err) {
        // Si no hay un error en el token,
        if (!err) {
          return res.status(204)
        }

        const tokenStatus = {
          token: {
            type: err.name,
            message: err.message,
          },
        }

        // Si el token ha expirado
        if (err.expiredAt) {
          Object.assign(tokenStatus.token, {
            expiredAt: err.expiredAt
          })
        }

        return res.status(400).json({ ...tokenStatus })
      })

      return res.status(204)
    } catch (error) {
      return res.status(403).send({ error: error.message })
    }
  }
}
