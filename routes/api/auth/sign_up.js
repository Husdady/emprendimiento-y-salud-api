// Librarys
const { Router } = require('express')
const router = Router()

// Models
const Users = require('@models/users/User')

// Controllers
const AuthRegisterController = require("@controllers/auth/Auth.Register.Controller")

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifyPermission = require('@middlewares/user/verifyPermission')
const { uploadImage } = require('@middlewares/upload/Upload.Middleware')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')
const { uploadImageToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar permiso para crear un usuario
const permissionRequiredToCreateUsers = verifyPermission({
  action: 'crear usuarios',
  permission: 'createUsers',
})

// Crear cuenta como Admin
router.post(
  "/signup/admin",
  verifySecretPassword('No tienes permisos para crear un usuario administrador'),
  AuthRegisterController.createAdmin,
)

// Crear cuenta como Usuario
router.post(
  '/signup/user',
  verifySecretPassword('No tienes permisos para crear usuarios!'),
  [verifyToken, permissionRequiredToCreateUsers],
  upload.single('profilePhoto'),
  AuthRegisterController.createUser,
  uploadImageToCloudinary((fileId) => ({
    folder: "users",
    public_id: "user-" + fileId,
  })),
  uploadImage({
    Model: Users,
    path: "profilePhoto",
    uploadError: 'Ha ocurrido un error al subir la foto de perfil del usuario',
  }),
)

module.exports = router
