// Librarys
const { Router } = require('express')
const router = Router()

// Models
const Testimony = require('@models/testimonials/Testimony')

// Controllers
const TestimonialsController = require('@controllers/testimonials/Testimonials.Controller')

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifyPermission = require('@middlewares/user/verifyPermission')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')
const { uploadImage } = require('@middlewares/upload/Upload.Middleware')
const { uploadImageToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar permiso para crear un testimonio
const permissionRequiredToCreateTestimonials = verifyPermission({
  action: 'crear testimonios',
  permission: 'createTestimonials',
})

// Verificar permiso para editar un testimonio
const permissionRequiredToEditTestimonials = verifyPermission({
  action: 'editar testimonios',
  permission: 'editTestimonials',
})

// Verificar permiso para eliminar un testimonio
const permissionRequiredToDeleteTestimonials = verifyPermission({
  action: 'eliminar testimonios',
  permission: 'deleteTestimonials',
})

// Crear nuevo testimonio
router.post(
  '/add',
  verifySecretPassword('You do not have permissions to create an testimony'),
  [verifyToken, permissionRequiredToCreateTestimonials],
  upload.single('authorPhoto'),
  TestimonialsController.createNewTestimony,
  uploadImageToCloudinary((fileId) => ({
    folder: "testimonials",
    public_id: "testimony-" + fileId
  })),
  uploadImage({
    Model: Testimony,
    path: "author.photo",
    uploadError:  "Ha ocurrido un error al subir la foto del autor",
  }),
)

// Editar testimonio
router.put(
  '/:testimonyId',
  [verifyToken, permissionRequiredToEditTestimonials],
  upload.single('authorPhoto'),
  TestimonialsController.editTestimony,
  uploadImageToCloudinary((fileId) => ({
    folder: "testimonials",
    public_id: "testimony-" + fileId,
  })),
  uploadImage({
    Model: Testimony,
    path: "author.photo",
    uploadError:  "Ha ocurrido un error al actualizar la foto del autor",
  }),
)

// Eliminar testimonio por id
router.delete(
  '/:testimonyId',
  [verifyToken, permissionRequiredToDeleteTestimonials],
  TestimonialsController.deleteTestimony,
)

module.exports = router
