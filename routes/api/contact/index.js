// Librarys
const { Router } = require('express')
const router = Router()

// Models
const Contact = require('@models/contact')

// Controllers
const ContactController = require('@controllers/contact/Contact.Controller')

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifyPermission = require('@middlewares/user/verifyPermission')
const { uploadImage } = require('@middlewares/upload/Upload.Middleware')
const { uploadImageToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar permiso para actualizar la información de contacto
const permissionRequiredToEditContactInformacion = verifyPermission({
  action: 'actualizar información de contacto',
  permission: 'editContactInformacion',
})

// Actualizar información de contacto
router.post(
  '/update',
  [verifyToken, permissionRequiredToEditContactInformacion],
  upload.single('contactPhoto'),
  ContactController.updateContactInformation,
  uploadImageToCloudinary(() => ({
    folder: "contact",
    public_id: "yessica-milagros",
  })),
  uploadImage({
    Model: Contact,
    path: "contactPhoto",
    uploadError: "Ha ocurrido un error al añadir o actualizar la foto de contacto",
  }),
)

module.exports = router
