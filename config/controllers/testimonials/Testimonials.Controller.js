// Models
const Testimony = require('@models/testimonials/Testimony')

// Middleware
const { removeImageFromCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { Validations } = require('@utils/Validations')

const { validateSchema } = Validations

// Reglas para crear un usuario
const SchemaTestimonyCreaction = {
  author: String,
  country: String,
  testimony: String,
  emptyBody: "You need to provide the user fields: 'author', 'age', etc.",
}

// Validar las reglas de un esquema
const validateTestimony = validateSchema(SchemaTestimonyCreaction)

async function createNewTestimony(req, res, next) {
  try {
    // Validar el body
    const body = validateTestimony(req.body)
    // Si existen errores en el body, devolver errores
    if (body.error) throw new Error(body.error)

    // Obtener datos del body
    const { author, age, country, testimony } = req.body

    // Verificar si ya existe un testimonio
    const existTestimony = await Testimony.exists({ 'author.name': author })

    if (existTestimony) throw new Error('¡Ya existe un autor con ese testimonio!')

    // Crear nuevo usuario
    const newTestimony = new Testimony({
      author: {
        name: author,
        short_name: author.replace(/\s/gim, '-'),
        age: age,
        country: country,
      },
      testimony: testimony,
    })

    // Guardar usuario
    await newTestimony.save()

    // Pasar id del usuario al siguiente middleware
    req.fileId = newTestimony._id

    // Mensaje existoso
    const successMessage =  "Se ha creado el testimonio exitosamente!"

    req.successMessage = successMessage;

    // Continuar al siguiente middleware
    if (req.file) next();

    // Retornar mensaje exitoso
    return res.status(200).json({ message: successMessage })
  } catch (error) {
    return res.status(401).send({ error: error.message })
  }
}

async function editTestimony(req, res, next) {
  try {
    // Setear id de autor de testimonio
    const { testimonyId } = req.params

    // Obtener datos del body
    const { author, age, country, testimony, authorPhotoName } = req.body

    // Encontrar si ya existe un autor con ese nombre
    const testimonyFound = await Testimony.findOne({ _id: testimonyId }).select({ _id: 1 }).lean();

    // Si ya existe un autor con un nombre repetido
    if (testimonyFound._id !== testimonyId) {
      throw new Error('Ya existe un autor registrado con ese nombre!')
    }

    const formHasBeenEdited = JSON.parse(req.body.formHasBeenEdited);

    // Si la información del autor sigue siendo la misma
    if (!formHasBeenEdited) {
      throw new Error('La información del autor es la misma, debe proporcionar nuevos datos')
    }

    // Nueva información del usuario
    const newDataAuthor = {
      author: {
        name: author,
        short_name: author.replace(/\s/gim, '-'),
        age: age,
        country: country,
      },
      testimony: testimony,
    }

    const existAuthorPhoto = JSON.parse(req.body.existAuthorPhoto)

    // Si se ha eliminado la foto del autor
    if (!existAuthorPhoto) {
      // Obtener el id de la imagen de Cloudinary que se va a eliminar
      const public_id = `testimonials/testimony-${testimonyId}`;

      // Eliminar imagen de Cloudinary
      await removeImageFromCloudinary(public_id);

      // Eliminar foto de autor de la DB
      Object.assign(newDataAuthor.author, {
        photo: null,
      })
    }

    // Actualizar testimonio del autor
    await Testimony.findByIdAndUpdate(testimonyId, { $set: newDataAuthor })

    // Mensaje existoso
    const successMessage = "Se ha actualizado exitosamente la información de " + author;

    // Setear id del autor
    req.fileId = testimonyId

    // Si existe una imagen como archivo
    if (req.file) {
      // Setear mensaje exitoso
      req.successMessage = successMessage;

      // Continuar al siguiente middleware
      next()
    }

    // Retornar mensaje exitoso
    return res.status(200).json({ message: successMessage })
  } catch (error) {
    if (error.codeName === 'DuplicateKey') {
      return res.status(400).send({ error: 'Ya existe un autor registrado con ese nombre. Intente con otro' })
    }
    
    return res.status(400).send({ error: error.message });
  }
}

// Eliminar un usuario por id
async function deleteTestimony(req, res) {
  try {
    // Eliminar el testimonio de un autor
    const testimony = await Testimony.findByIdAndDelete(req.params.testimonyId)

    // Si el usuario tiene foto de perfil
    if (testimony.author?.photo) {
      await removeImageFromCloudinary(testimony._id);
    }

    // Retornar respuesta del servidor
    return res.status(204).json({});
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}

module.exports = {
  editTestimony,
  deleteTestimony,
  createNewTestimony,
}
