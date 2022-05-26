// Models
const Role = require('@models/users/Role')

// Permissions
const adminPermissions = require('@utils/permissions/admin-permissions')
const managerPermissions = require('@utils/permissions/manager-permissions')
const moderatorPermissions = require('@utils/permissions/moderator-permissions')
const employeePermissions = require('@utils/permissions/employee-permissions')
const userPermissions = require('@utils/permissions/user-permissions')

// Crear roles por defecto
module.exports = async function createDefaultRoles() {
  try {
    // Obtener el total de roles
    const roleCount = await Role.estimatedDocumentCount()

    if (roleCount > 0) return
    
    const admin = { name: 'Administrador', permissions: adminPermissions }
    const manager = { name: 'Gerente', permissions: managerPermissions }
    const moderator = {
      name: 'Moderador',
      permissions: moderatorPermissions,
    }
    const employee = { name: 'Empleado', permissions: employeePermissions }
    const user = { name: 'Usuario', permissions: userPermissions }

    Promise.all([
      new Role(admin).save(),
      new Role(manager).save(),
      new Role(moderator).save(),
      new Role(employee).save(),
      new Role(user).save()
    ])
  } catch (error) {
    console.log('[createDefaultRoles]', error)
  }
}
