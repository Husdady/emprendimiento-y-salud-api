// Models
const Contact = require('@models/contact')

// Middlewares
const { removeImageFromCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { convertEmptySpacesInHyphens } = require('@utils/Helper')

// Comprobar si existe un usuario administrador
exports.updateContactInformation = async function(req, res, next) {
  try {
    const {
      fullname,
      aboutMe,
      testimony,
      phone,
      omnilifeCode,
      emails,
      socialNetworks
    } = req.body

    const formHasBeenEdited = JSON.parse(req.body.formHasBeenEdited)

    // Si la información del usuario sigue siendo la misma
    if (!formHasBeenEdited) {
      throw new Error('La información no ha sido actualizada, por favor actualice sus datos por otros que no sean iguales a los actuales')
    }

    // Nueva información del usuario
    const newContactData = {
      fullname: fullname,
      aboutMe: aboutMe,
      testimony: testimony,
      phone: phone,
      omnilifeCode: omnilifeCode,
      emails: JSON.parse(emails),
      socialNetworks: JSON.parse(socialNetworks),
    }

    const existContactPhoto = JSON.parse(req.body.existContactPhoto)

    if (!existContactPhoto) {

      // Obtener el id de la imagen de Cloudinary que se va a eliminar
      const public_id = "contact/yessica-milagros";

      // Eliminar imagen de Cloudinary
      await removeImageFromCloudinary(public_id)

      // Eliminar foto de contacto de la DB
      Object.assign(newContactData, {
        contactPhoto: null
      })
    }

    const existContactInformation = await Contact.exists({})

    let contact = null;

    // Si ya existe la información de contacto
    if (existContactInformation) {
      const fields = { _id: 1 }

      // Actualizar información
      contact = await Contact.findOneAndUpdate({}, newContactData).select(fields).lean()
    } else {
      // Crear contacto
      contact = new Contact(newContactData)

      // Guardar contacto
      await contact.save()
    }

    // Mensaje existoso
    const successMessage = "Se actualizó exitosamente la información de contacto"

    // Setear id del contacto
    req.fileId = contact._id

    // Si existe una imagen como archivo
    if (req.file) {
      // Setear mensaje exitoso
      req.successMessage = successMessage

      // Continuar al siguiente middleware
      return next();
    }

    // Retornar mensaje exitoso
    return res.status(200).json({ message: successMessage })
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}
