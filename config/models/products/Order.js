"use strict";

// Cargar esquema de mongoose
const { Schema, mongoose } = require("@database/connection");

// Creamos el objeto del esquema y sus atributos
const createOrderSchema = function (config) {
  const { model, refProduct, collectionName } = config;
  const ProductSchema = new Schema(
    {
      clientId: { type: String, required: true, unique: true },
      clientName: { type: String, required: true },
      clientPhone: { type: String, required: true },
      clientProducts: [
        {
          _id: String,
          optionalMessage: String,
          status: { type: String, required: true },
          totalCost: { type: Number, required: true },
          totalUnits: { type: Number, required: true },
          creationDate: { type: Date, required: true },
          product: {
            ref: refProduct,
            type: Schema.Types.ObjectId,
            required: true,
          }
        }
      ]
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
const SeytuOrders = createOrderSchema({
  model: "SeytuOrders",
  refProduct: "SeytuProducts",
  collectionName: "seytu.products.orders",
})

// Crear esquema de los Productos Omnilife
const OmnilifeOrders = createOrderSchema({
  model: "OmnilifeOrders",
  refProduct: "OmnilifeProducts",
  collectionName: "omnilife.products.orders",
})

// Exportar esquema
module.exports = { SeytuOrders, OmnilifeOrders };
