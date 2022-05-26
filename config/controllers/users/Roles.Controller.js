// Models
const Role = require('@models/users/Role')
const User = require('@models/users/User')

// Utils
const { Validations } = require('@utils/Validations')
const { SchemaRoleCreation } = require('@utils/schemas')

// Validar las reglas de un esquema
const validateRoleCreation = Validations.validateSchema(SchemaRoleCreation)

// Crear rol de usuario
async function createRole(req, res) {
  try {
    // Validar el body
    const body = validateRoleCreation(req.body)
    // Si existen errores en el body, devolver errores
    if (body.error) throw new Error(body.error)

    // Comprobar si existe la clave secreta
    Validations.validateSecretPassword({
      secret_password: req.headers.secret_password,
      onDifferent: function () {
        return res.status(401).json({
          message: 'No tienes permisos para crear roles!',
        })
      },
    })

    // Obtener datos del body
    const { roleName, permissions } = req.body

    // Verificar si ya existe un usuario o un admin con ese correo
    const existRoleName = await Role.exists({ name: roleName })

    if (existRoleName) throw new Error('¡Ya existe un rol con ese nombre!')

    // Crear nuevo usuario
    const newRole = new Role({ name: roleName, permissions: permissions })

    // Guardar usuario
    await newRole.save()

    // Retornar mensaje exitoso
    res.status(200).json({
      newRole: newRole,
      message: 'Se ha creado un nuevo rol exitosamente!',
    })
  } catch (error) {
    return res.status(401).send({ error: error.message })
  }
}

// Editar un usuario por id
async function editRole(req, res) {
  try {
    // Obtener datos del body
    const { roleName, permissions, formHasBeenEdited } = req.body

    // Si el formulario no ha sido editado
    if (!formHasBeenEdited) {
      throw new Error(`La información del rol '${roleName}' sigue siendo la misma, por favor ingresa nuevos datos`)
    }

    // Si el nombre del rol es igual a 'Usuario'
    if (roleName === 'Usuario') {
      throw new Error("El rol 'Usuario' es inmutable")
    }

    // Comprobar si exite un rol con nombre duplicado
    const existRoleName = await Role.exists({ name: roleName })

    if (existRoleName) {
      throw new Error('Ya existe un rol registrado con ese nombre')
    }

    // Setear id del rol
    const { roleId } = req.params

    // Encontrar al rol que se va a editar
    const existRole = await Role.exists({ _id: roleId })

    // Si el usuario no existe
    if (!existRole) {
      throw new Error(`No se ha encontrado el rol '${roleName}' para editar su información`)
    }

    // Nueva información del usuario
    const newRoleData = {
      name: roleName,
      permissions: permissions,
    }

    // Actualizar rol
    await Role.findByIdAndUpdate(roleId, newRoleData)

    // Retornar respuesta de servidor
    res.status(204).json({})
  } catch (err) {
    if (err.codeName === 'DuplicateKey') {
      res.status(400).send({
        error: 'Ya existe un rol registrado con ese nombre',
      })
    } else {
      res.status(400).send({ error: err.message })
    }
  }
}

// Eliminar un rol de usuario por id
async function deleteRole(req, res) {
  try {
    const { roleId } = req.params

    // Si el rol a eliminar es el rol 'Usuario'
    const roleFound = await Role.findById(roleId).select({ name: 1 })

    if (roleFound.name === 'Usuario') {
      throw new Error("El rol 'Usuario' no se puede eliminar")
    }

    // Eliminar rol
    await Role.findByIdAndDelete(roleId)

    // Obtener rol 'Usuario' del modelo Roles
    const userRole = await Role.findOne({ name: 'Usuario' }, { _id: 1 })

    // Actualizar todos los usuarios que tengan el rol que se eliminó por el rol 'Usuario'
    await User.updateMany({ role: roleId }, { role: userRole._id }, { multi: true })

    // Retornar respuesta de servidor
    res.status(204).json({})
  } catch (err) {
    res.status(400).send({ error: err.message })
  }
}

module.exports = {
  createRole,
  editRole,
  deleteRole,
}
