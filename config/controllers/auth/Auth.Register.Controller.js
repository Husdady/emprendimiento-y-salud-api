// Librarys
const { v4: uuidv4 } = require('uuid')

// Models
const Role = require('@models/users/Role')
const User = require('@models/users/User')
const Admin = require('@models/users/Admin')

// Services
const { sendEmailConfirmation } = require('@services/sendinblue/sendEmail')

// Utils
const { Validations } = require('@utils/Validations')
const { encryptPassword, createToken } = require('@utils/Helper')
const adminPermissions = require('@utils/permissions/admin-permissions')
const { SchemaAdminCreation, SchemaUserCreation } = require('@utils/schemas')

// Validar las reglas de un esquema
const validateUserCreation = Validations.validateSchema(SchemaUserCreation)
const validateAdminCreation = Validations.validateSchema(SchemaAdminCreation)

// Crear usuario administrador
exports.createAdmin = async function(req, res) {
  try {
    // Validar el body
    const body = validateAdminCreation(req.body)
    // Si existen errores en el body, devolver errores
    if (body.error) throw new Error(body.error)

    const { fullname, email, password } = req.body

    // Obtener el total de admins
    const adminCount = await Admin.estimatedDocumentCount()

    if (adminCount > 0) throw new Error('¡Ya existe un usuario administrador!')

    // Setear rol de Administrador
    const adminRole = {
      name: 'Administrador',
      permissions: adminPermissions,
    }

    // Encriptar contraseña de usuario administrador
    const encryptedPassword = await encryptPassword(password)

    // Setear datos del usuario Administrador
    const newAdmin = new Admin({
      role: adminRole,
      fullname: fullname,
      password: encryptedPassword,
      email: email.toLowerCase().trim(),
      verifiedEmail: false,
      secretKey: uuidv4(),
    })

    // Crear token de confirmación de correo electrónico de usuario administrador
    const confirmationCode = createToken({
      exp: 3600,
      secretType: 'emailConfirmation',
      data: { id: newAdmin._id },
    })

    // Setear el código de confirmación al usuario administrador
    newAdmin.confirmationCode = confirmationCode

    // Enviar confirmación de correo electrónico
    await sendEmailConfirmation({
      confirmationCode: `?accountType=admin&email=${email}&confirmationCode=${confirmationCode}`,
      user: {
        email: email,
        fullname:fullname,
      },
    })

    // Guardar un nuevo usuario administrador
    await newAdmin.save()
    
    return res.status(201).json({ })
  } catch (error) {
    return res.status(400).send({ error: error.message })
  }
}

// Crear usuario
exports.createUser = async function(req, res, next) {
  try {
    // Validar el body
    const body = validateUserCreation(req.body)
    // Si existen errores en el body, devolver errores
    if (body.error) throw new Error(body.error)

    // Obtener datos del body
    const { fullname, email, password, role } = req.body

    // Verificar si ya existe un usuario o un admin con ese correo
    const existEmail = await Promise.all([
      Admin.exists({ email }),
      User.exists({ email })
    ])

    // Si existe un usuario o admin, retornar un error 
    if (existEmail[0] || existEmail[1]) {
      throw new Error('¡Ya existe un usuario con ese correo electrónico!')
    }

    // Encriptar contraseña del usuario
    const encryptedPassword = await encryptPassword(password)

    // Crear nuevo usuario
    const newUser = new User({
      fullname: fullname,
      deleted: false,
      verifiedEmail: false,
      password: encryptedPassword,
      email: email.toLowerCase().trim(),
      secretKey: uuidv4(),
    })

    // Crear token de confirmación de correo electrónico del nuevo usuario
    const confirmationCode = createToken({
      exp: 3600,
      secretType: 'emailConfirmation',
      data: { id: newUser._id },
    })

    // Si se recibe desde 'body' un rol, verificar si existe ese rol en la colección 'Roles'
    if (role) {
      const foundRole = await Role.findOne({ name: role }).select({ _id: 1 })
      newUser.role = foundRole._id
    } else {
      // Sino asignar un rol por defecto, en este caso, el rol 'Usuario'. Verificar si está disponible este rol
      const userRole = await Role.findOne({ name: 'Usuario' }).select({ _id: 1 })
      newUser.role = userRole._id
    }

    // Setear el código de confirmación al usuario
    newUser.emailConfirmationCode = confirmationCode
    
    // Guardar usuario
    await newUser.save()
    
    // Enviar confirmación de correo electrónico
    await sendEmailConfirmation({
      confirmationCode: `?accountType=user&email=${email}&confirmationCode=${confirmationCode}`,
      user: {
        email: email,
        fullname:fullname,
      },
    })
    
    // Pasar id del usuario al siguiente middleware
    req.fileId = newUser._id

    // Mensaje existoso
    const successMessage = 'Se ha creado un nuevo usuario exitosamente!'

    req.successMessage = successMessage

    // Continuar al siguiente middleware
    if (req.file) return next()

    // Retornar mensaje exitoso
    return res.status(200).json({ message: successMessage })
  } catch (error) {
    return res.status(401).send({ error: error.message })
  }
}
