// Models
const Users = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Services
const { sendPasswordConfirmation } = require('@services/sendinblue/sendEmail')

// Utils
const { isEmail, isEmptyObject } = require('@utils/Validations')
const { createToken, comparePassword, encryptPassword } = require('@utils/Helper')

const populateFields = [{ path: 'role', select: 'name -_id' }]

// Verificar la confirmación de contraseña olvidada
exports.verifyPasswordConfirmation = async function(req, res) {
  try {
    const { email, confirmationCode } = req.body;

    const fields = {
      email: email,
      passwordConfirmationCode: confirmationCode,
    }

    const promises = [Admin.exists(fields), Users.exists(fields)]

    // Obtener usuarios que coincidan con ese 'email' y 'confirmationCode'
    const userFounds = await Promise.all(promises)

    // Si no hay usuarios con esos campos
    const emptyUsers = userFounds.every((user) => !user)

    // Retornar un error
    if (emptyUsers) {
      throw new Error('Error al verificar el código de confirmación')
    }

    return res.status(201).json({})
  } catch(error) {
    return res.status(401).json({ error: error.message })
  }
}

// Comprobar si existe el correo electrónico de un usuario
exports.updateForgotPassword = async function(req, res) {
  try {
    if (isEmptyObject(req.body)) {
      throw new Error('Body is empty object!')
    }

    const { email, password, accountType, confirmationCode } = req.body

    // Comprobar si es una cuenta válida
    const isValidAccountType = ['admin', 'user'].includes(accountType)

    // Retornar error si es una cuenta inválida
    if (!isValidAccountType) {
      throw new Error('Tipo de cuenta inválida!')
    }

    // Comprobar si es un correo electrónico válido
    if (!isEmail(email)) {
      throw new Error('Correo electrónico no válido!')
    }
	
    const models = {
      user: Users,
      admin: Admin,
    }

    // Obtener el modelo actual dependiendo del tipo de cuenta
    const currentModel = models[accountType]

    // Comprobar si existe el usuario
    const existUser = currentModel.exists({
      email: email,
      passwordConfirmationCode: confirmationCode
    })

    // Retornar un error si no se encuentra un usuario
    if (!existUser) {
      throw new Error('Usuario no encontrado')
    }

    // Encontrar al usuario
    const user = await currentModel.findOne({ email }).select('password').lean()

    // Comparar contraseñas para comprobar si son iguales
    const matchPassword = await comparePassword(password, user.password)

    // Si la contraseña no es igual a la contraseña del usuario encontrado
    if (matchPassword) {
      throw new Error('A ocurrido un error al actualizar tu contraseña')
    }
    
    // Encriptar contraseña
    const encryptNewPassword = await encryptPassword(password)

    // Actualizar contraseña del usuario encontrado
    await currentModel.findOneAndUpdate({ email }, {
      password: encryptNewPassword
    }).lean()

    return res.status(201).json({ })
	} catch(error) {
		return res.status(401).json({ error: error.message })
	}
}

// Enviar confirmación al correo electrónico de un usuario para actualizar su contraseña olvidada
exports.sendPasswordConfirmation = async function(req, res) {
  const { email } = req.body

  const fields = {
    email: 1,
    fullname: 1,
    passwordConfirmationCode: 1,
  }

  const selectUserFields = {
    role: 1,
    ...fields,
  }

  const selectAdminFields = {
    role: { name: 1 },
    ...fields,
  }

  try {
    // Promesas
    const promises = [
      Admin.findOne({ email }).select(selectAdminFields).lean(),
      Users.findOne({ email }).select(selectUserFields).populate(populateFields).lean(),
    ]

    // Ejecutar promesas
    const users = await Promise.all(promises)

    // Encontrar a un usuario por email
    const userFound = users.find(user => !!(user))
    
    // Si no existe un usuario encontrado
    if (!userFound) {
      throw new Error(`No se ha encontrado el usuario con el correo electrónico ${email}`)
    }

    // Crear token de confirmación de correo electrónico de usuario administrador
    const confirmationCode = createToken({
      exp: 3600,
      secretType: 'forgotPassword',
      data: { id: userFound._id },
    })

    // Enviar confirmación de correo electrónico
    await sendPasswordConfirmation({
      confirmationCode: `?accountType=${accountType}&email=${email}&confirmationCode=${confirmationCode}`,
      user: {
        email: userFound.email,
        fullname: userFound.fullname,
      },
    })

    // Setear el código de confirmación al usuario
    const emailConfirmationCode = {
      emailConfirmationCode: confirmationCode
    }

    const isAdminRole = userFound.role.name === 'Administrador'
    const accountType = isAdminRole ? 'admin' : 'user'
    const isAdminAccount = accountType === 'admin'

    if (isAdminAccount) {
      await Admin.findByIdAndUpdate(userFound._id, emailConfirmationCode)
    } else {
      await Users.findByIdAndUpdate(userFound._id, emailConfirmationCode)
    }

    return res.status(200).json({ message: `Se ha enviado correctamente la confirmación al correo electrónico: ${userFound.email}` })
  } catch(error) {
    return res.status(401).json({ error: error.message })
  }
}
