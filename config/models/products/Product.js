"use strict";

// Cargar esquema de mongoose
const { Schema, mongoose } = require("@database/connection");

// Creamos el objeto del esquema y sus atributos
const createProductSchema = function (config) {
  const { model, refCategory, collectionName } = config;
  const ProductSchema = new Schema(
    {
      initialName: String,
      defaultImage: Object,
      images: [{ type: Object }],
      name: { type: String, require: true },
      price: { type: Number, require: true },
      description: {
        type: String,
        require: true,
        minLength: 50,
        maxLength: 350,
      },
      content: {
        type: String,
        minLength: 25,
        maxLength: 100
      },
      stock: { type: Number, require: true },
      benefits: [
        {
          _id: Number,
          benefit: {
            type: String,
            maxLength: 300
          },
        }
      ],
      categories: [
        {
          ref: refCategory,
          type: Schema.Types.ObjectId,
          require: true,
        }
      ],
      usageMode: {
        type: String,
        require: true,
        minLength: 50,
        maxLength: 500,
      },
      totalVisits: { type: Number, default: 0 }
    },
    {
      versionKey: false,
      timestamps: true,
      collection: collectionName,
    }
  );
  
  return mongoose.model(model, ProductSchema);
};

// Crear esquema de los Productos Seytú
const SeytuProducts = createProductSchema({
  model: "SeytuProducts",
  refCategory: "SeytuCategories",
  collectionName: "seytu.products",
})

// Crear esquema de los Productos Omnilife
const OmnilifeProducts = createProductSchema({
  model: "OmnilifeProducts",
  refCategory: "OmnilifeCategories",
  collectionName: "omnilife.products",
})

// Exportar esquema
module.exports = { SeytuProducts, OmnilifeProducts };
