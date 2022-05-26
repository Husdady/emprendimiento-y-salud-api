'use strict'

// Cargar esquema de mongoose
const { Schema, mongoose } = require('@database/connection')

// Creamos el objeto del esquema y sus atributos
const TestimonialsSchema = new Schema(
  {
    author: {
      name: {
        type: String,
        require: true,
        unique: true,
      },
      short_name: {
        type: String,
        require: true,
        lowercase: true
      },
      age: String,
      country: {
        type: String,
        require: true
      },
      photo: Object
    },
    testimony: { type: String, require: true },
  },
  {
    versionKey: false,
    timestamps: true,
    collection: 'testimonials',
  },
)

// Exportar esquema
module.exports = mongoose.model('Testimonials', TestimonialsSchema)