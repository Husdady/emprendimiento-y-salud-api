"use strict";

const { Schema, mongoose } = require("@database/connection");

// Crear esquema del modelo
const RoleSchema = new Schema(
  {
    name: { type: String, unique: true, required: true }, // Nombre del rol
    permissions: { type: Object, required: true }, // Permisos disponibles del rol
  },
  {
    versionKey: false,
    collection: "roles",
  }
);

// Exportar modelo
module.exports = mongoose.model("Role", RoleSchema);
