"use strict";

const { Schema, mongoose } = require("@database/connection");

// Crear esquema del modelo
const AdminSchema = new Schema(
  {
    profilePhoto: Object, // Foto de perfil del usuario administrador
    secretKey: { type: String, required: true, unique: true }, // Clave secreta del usuario administrador
    fullname: { type: String, required: true }, // Nombre completo del usuario administrador
    password: { type: String, required: true }, // Contraseña del usuario administrador
    verifiedEmail: { type: Boolean, required: true }, // Si el usuario administrador ha verificado su correo electrónico
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },// Correo electrónico del usuario administrador
    role: { ref: "Role", type: Object, required: true }, // Rol del usuario administrador, que por defecto es 'Administrador',
    emailConfirmationCode: String, // Código de confirmación de correo electrónico olvidado del usuario
    passwordConfirmationCode: String // Código de confirmación de contraseña olvidada del usuario
  },
  {
    versionKey: false,
    timestamps: true,
    collection: "admin",
  }
);

// Exportar modelo
module.exports = mongoose.model("Admin", AdminSchema)
