'use strict'

const { Schema, mongoose } = require('@database/connection')

// Crear esquema del modelo
const UserSchema = new Schema(
  {
    deletedAt: Date, // Fecha de eliminación del usuario
    profilePhoto: Object, // Foto de perfil del usuario
    secretKey: { type: String, required: true, unique: true }, // Clave secreta del usuario
    fullname: { type: String, require: true }, // Nombre completo del usuario
    password: { type: String, require: true }, // Contraseña del usuario
    deleted: { type: Boolean, require: true }, // Si el usuario ha sido eliminado
    verifiedEmail: { type: Boolean, require: true }, // Si el usuario ha verificado su correo electrónico
    email: { type: String, require: true, unique: true, trim: true, lowercase: true }, // Correo electrónico del usuario
    role: { ref: 'Role', type: Schema.Types.ObjectId, require: true }, // Rol del usuario
    emailConfirmationCode: String, // Código de confirmación de correo electrónico olvidado del usuario
    passwordConfirmationCode: String // Código de confirmación de contraseña olvidada del usuario
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'users',
  },
)

// Exportar modelo
module.exports = mongoose.model('User', UserSchema)
