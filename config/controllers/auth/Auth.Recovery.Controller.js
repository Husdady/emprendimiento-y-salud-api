// Models
const Users = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Services
const { sendPasswordConfirmation } = require('@services/sendinblue/sendEmail')

// Utils
const { createToken } = require('@utils/Helper')

// Recuperar contraseña de un usuario
exports.recoveryUserPassword = async function(req, res) {
  const { email } = req.body

  // Si no existe el correo electrónico de un usuario
  if (!email) {
    throw new Error(`El correo electrónico ${email} no existe`)
  }

  try {
    // Comprobar si existe un usuario o admin con correo electrónico
    const promises = [
      Admin.exists({ email }),
      Users.exists({ email })
    ]

    const [admin, user] = await Promise.all(promises)

    // Si no existe un usuario con ese nombre
    if (!admin && !user) {
      throw new Error('Usuario no encontrado!')
    }

    const fields = {
      email: 1,
      fullname: 1,
      role: 1,
    }

    // Obtener el usuario por nombre y 'secretKey'
    const promisesForFoundUsers = [
      Admin.findOne({ email }).select(fields).lean(),
      Users.findOne({ email }).select(fields).lean()
    ]

    // Usuarios encontrados
    const userFounds = await Promise.all(promisesForFoundUsers)

    // Comprobar si se han encontrado usuarios
    const usersEmpty = userFounds.every((user) => user === null)

    // Si no existen usuarios encontrados
    if (usersEmpty) {
      throw new Error('A ocurrido un error para recuperar la contraseña del usuario')
    }

    // Obtener el usuario encontrado
    const userFound = userFounds.find((user) => !!(user))

    // Si no existe un usuario encontrado
    if (!userFound) {
      const txt = `No se ha encontrado el usuario con el correo electrónico ${email}`
      throw new Error(txt)
    }

    // Crear token de recuperación de contraseña de un usuario
    const confirmationCode = createToken({
      exp: 3600,
      secretType: 'forgotPassword',
      data: { id: userFound._id },
    })

    // Obtener el tipo de cuenta
    const accountType = userFound.role.name === 'Administrador' ? 'admin' : 'user'

    const models = {
      user: Users,
      admin: Admin,
    }

    // Enviar confirmación de correo electrónico
    await sendPasswordConfirmation({
      confirmationCode: `?accountType=${accountType}&email=${email}&confirmationCode=${confirmationCode}`,
      user: {
        email: email,
        fullname: userFound.fullname,
      },
    })

    // Actualizar código de confirmación de contraseña olvidada de un usuario
    await models[accountType].findByIdAndUpdate(userFound._id, {
      passwordConfirmationCode: confirmationCode
    })

    return res.status(201).json({})
  } catch(error) {
    return res.status(401).send({ error: error.message })
  }
}

// Recuperar correo electrónico de un usuario
exports.recoveryUserEmail = async function(req, res) {
  const { username, secretKey } = req.params

  // Si no existen los parámetros 'username' y 'secretKey'
  if (!username || !secretKey) {
    throw new Error("Necesitas proporcionar una 'secretKey'")
  }

  try {
    // Comprobar si existe un usuario o admin con ese nombre y 'secretKey'
    const promises = [
      Admin.exists({ fullname: username, secretKey: secretKey }),
      Users.exists({ fullname: username, secretKey: secretKey })
    ]

    const [admin, user] = await Promise.all(promises)

    // Si no existe un usuario con ese nombre
    if (!admin && !user) {
      throw new Error('Usuario no encontrado!')
    }

    const fields = { email: 1 }

    // Obtener el usuario por nombre y 'secretKey'
    const promisesForFoundUsers = [
      Admin.findOne({
        fullname: username,
        secretKey: secretKey
      }).select(fields).lean(),
      Users.findOne({ fullname: username, secretKey: secretKey }).select(fields).lean()
    ]

    // Usuarios encontrados
    const userFounds = await Promise.all(promisesForFoundUsers)

    // Comprobar si se han encontrado usuarios
    const usersEmpty = userFounds.every((user) => user === null)

    // Si no existen usuarios encontrados
    if (usersEmpty) {
      throw new Error(`A ocurrido un error para recuperar el correo electrónico del usuario ${username}`)
    }

    // Obtener el usuario encontrado
    const userFound = userFounds.find((user) => user !== null)

    // Retornar correo electrónico del usuario
    return res.status(200).json({
      email: userFound.email,
      message: 'Tú correo electrónico ha sido recuperado exitosamente'
    })
  } catch(error) {
    return res.status(401).send({ error: error.message })
  }
}

// Comprobar la clave secreta de un usuario para actualizar su email
exports.verifyUserSecretKey = async function(req, res) {
  try {
    const promises = [
      Admin.exists({ secretKey: req.body.secretKey }),
      Users.exists({ secretKey: req.body.secretKey })
    ]

    const [adminSecretKey, userSecretKey] = await Promise.all(promises)

    // Si no existe la 'secretKey' en el usuario administrador o en un usuario
    if (!adminSecretKey && !userSecretKey) {
      throw new Error('Inválida clave secreta')
    }

    return res.status(201).json({})
  } catch(error) {
    return res.status(401).send({ error: error.message })
  }
}
