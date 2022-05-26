// Librarys
const { Router } = require('express')
const router = Router()

// Models
const Admin = require('@models/users/Admin')

// Controllers
const AdminController = require('@controllers/admin/Admin.Controller')

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const { uploadImage } = require('@middlewares/upload/Upload.Middleware')
const { uploadImageToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar si existe un usuario administrador
router.get('/existAdmin', AdminController.existUserAdmin)

// Cambiar contraseña del usuario administrador
router.post('/change-my-password', verifyToken, AdminController.changePassword)

// Actualizar información personal del usuario administrador
router.put(
  '/update',
  verifyToken,
  upload.single('profilePhoto'),
  AdminController.updateMyPersonalInformation,
  uploadImageToCloudinary((fileId) => ({
    folder: "admin",
    public_id: "admin-" + fileId,
  })),
  uploadImage({
    Model: Admin,
    path: "settings.avatar",
    uploadError: "Ha ocurrido un error al actualizar tu foto de perfil",
  }),
)

// Cerrar cuenta del usuario administrador 
router.delete('/close-my-account', verifyToken, AdminController.closeMyAccount)

module.exports = router
