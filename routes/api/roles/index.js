// Librarys
const { Router } = require('express')
const router = Router()

// Controllers
const RolesController = require('@controllers/users/Roles.Controller')

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifyPermission = require('@middlewares/user/verifyPermission')

// Verificar permiso para editar un usuario
const permissionRequiredToCreateRoles = verifyPermission({
  action: 'crear roles',
  permission: 'createRoles',
})

// Verificar permiso para eliminar un usuario
const permissionRequiredToEditRoles = verifyPermission({
  action: 'editar roles',
  permission: 'editRoles',
})

// Verificar permiso para eliminar un usuario
const permissionRequiredToDeleteRoles = verifyPermission({
  action: 'eliminar roles',
  permission: 'deleteRoles',
})

// Crear rol de usuario
router.post(
  '/add',
  [verifyToken, permissionRequiredToCreateRoles],
  RolesController.createRole
)

// Eliminar rol de usuario por id
router.put(
  '/:roleId',
  [verifyToken, permissionRequiredToEditRoles],
  RolesController.editRole,
)

// Eliminar rol de usuario por id
router.delete(
  '/:roleId',
  [verifyToken, permissionRequiredToDeleteRoles],
  RolesController.deleteRole,
)

module.exports = router
