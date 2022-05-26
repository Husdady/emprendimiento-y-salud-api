// Librarys
const { Router } = require('express')
const router = Router()

// Models
const User = require('@models/users/User')

// Controllers
const UsersController = require('@controllers/users/Users.Controller')

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')
const getTotalUsers = require('@middlewares/user/getTotalUsers')
const verifyPermission = require('@middlewares/user/verifyPermission')
const { uploadImage } = require('@middlewares/upload/Upload.Middleware')
const { uploadImageToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar permiso para editar un usuario
const permissionRequiredToEditUsers = verifyPermission({
  action: 'editar usuarios',
  permission: 'editUsers',
})

// Verificar permiso para eliminar un usuario
const permissionRequiredToDeleteUsers = verifyPermission({
  action: 'eliminar usuarios',
  permission: 'deleteUsers',
})

// Verificar permiso para eliminar un usuario
const permissionRequiredToRestoreUsers = verifyPermission({
  action: 'restaurar usuarios',
  permission: 'restoreUsers',
})

// Obtener el total de usuarios
router.get(
  '/count',
  verifySecretPassword('You do not have permissions to get this information'),
  getTotalUsers
)

// Editar usuario por id
router.put(
  '/:userId',
  [verifyToken, permissionRequiredToEditUsers],
  upload.single('profilePhoto'),
  UsersController.editUser({
    errors: {
      userDataIsTheSame: 'La información del usuario es la misma, debe proporcionar nuevos datos'
    },
    successMessage: ({ fullname }) => 'Se ha actualizado exitosamente la información de ' + fullname,
  }),
  uploadImageToCloudinary((fileId) => ({
    folder: "users",
    public_id: "user-" + fileId,
  })),
  uploadImage({
    Model: User,
    path: "settings.avatar",
    uploadError: "Ha ocurrido un error al actualizar la foto de perfil del usuario",
  }),
)

// Actualizar información personal de un usuario
router.put(
  '/:userId/update',
  verifyToken,
  upload.single('profilePhoto'),
  UsersController.editUser({
    successMessage: 'Se actualizó tu información personal exitosamente',
    errors: {
      userDataIsTheSame: 'Tu información es la misma, debes proporcionar nuevos datos'
    },
  }),
  uploadImageToCloudinary((fileId) => ({
    folder: "users",
    public_id: "user-" + fileId
  })),
  uploadImage({
    Model: User,
    path: "settings.avatar",
    uploadError: 'Ha ocurrido un error al actualizar tu foto de perfil',
  }),
)

// Eliminar temporalmente un usuario por id
router.delete(
  '/:userId',
  [verifyToken, permissionRequiredToDeleteUsers],
  UsersController.deleteUser,
)

// Restaurar usuario por id
router.post(
  '/:userId/restore',
  [verifyToken, permissionRequiredToRestoreUsers],
  UsersController.restoreUser
)

// Cambiar contraseña de un usuario
router.post('/:userId/change-my-password', verifyToken, UsersController.changePassword)

module.exports = router
