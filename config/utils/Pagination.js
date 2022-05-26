// Librarys
const { sign } = require('jsonwebtoken')
const { ObjectId } = require('mongoose').Types
const { genSalt, hash, compare } = require('bcrypt')
const { GraphQLObjectType, GraphQLInputObjectType } = require('graphql')

// Utils
const {
  isNumber,
  isBoolean,
  isString,
  isEmptyString,
  isObject,
  isEmptyObject,
  isArray,
  isEmptyArray,
} = require('./Validations')

class Pagination {
  /**
   * Paginar un modelo
   * @param {skip: Number, limit: Number, model: Object}
   */
  static paginate({ skip, limit, model, sortBy, filters, extraFields }) {
    if (!model) return [];

    const pagination = [];
    console.log("-------------------------------")
    console.log("[skip]", skip)
    console.log("[limit]", limit)
    console.log("[sortBy]", sortBy)
    console.log("[filters]", filters)

    // Comprobar si "filters" es un objeto
    if (isObject(filters)) {
      const { excludeFields } = filters;
      const keys = Object.keys(filters);

      // Si existen campos a excluir en los filtros
      if (isArray(excludeFields)) {
        delete filters.excludeFields;

        for (const excludeField of excludeFields) {
          // Eliminar campos excluidos
          delete filters[excludeField];
        }
      }

      const $match = {}

      for (const key of keys) {
        // Obtener filtro
        const filterValue = filters[key] 
        const invalidFilter = [null, undefined].includes(filterValue);

        // Si es un filtro inválido
        if (invalidFilter || isEmptyArray(filterValue)) continue;

        // Agregar filtro
        $match[key] = filterValue;
      }

      // Si existen filtros, agregarlos a la paginación
      if (!isEmptyObject($match)) {
        pagination.push({ $match: $match });
      }
    }

    // Si existen campos extras para agregar a filtros
    if (isObject(extraFields)) {
      const keys = Object.keys(extraFields);

      for (const key of keys) {
        pagination.push({
          [key]: extraFields[key]
        });
      }
    }

    // Comprobar si "sortBy" es un objeto
    if (isObject(sortBy)) {
      pagination.push({ $sort: sortBy })
    }

    // Comprobar válido valor númerico de "skip"
    if (isNumber(skip)) {
      pagination.push({ $skip: skip })
    }

    // Comprobar válido valor númerico de "limit"
    if (isNumber(limit)) {
      pagination.push({ $limit: limit })
    }

    console.log("-------------------------------");
    console.log("[pagination]", pagination);
    return model.aggregate(pagination);
  }

  /**
   * Obtener los últimos elementos de un modelo con un límite
   * @param {Model: Object, limit: Number}
   */
  static getLastest({ limit, model }) {
    return Pagination.paginate({
      limit: limit,
      model: model,
      sortBy: {
        createdAt: -1
      }
    })
  }

  /**
   * Aleatorizar los productos
   * @param {Model: Object, limit: Number, productToExclude: String}
   */
  static randomizeProducts({ Model, limit, productToExclude }) {
    const config = []

    // Comprobar si existe un límite definido
    if (limit) {
      config.push({
        $sample: {
          size: limit
        }
      })
    }

    // Comprobar si se debe excluir un producto de la query
    if (productToExclude) {
      config.push({
        $match: {
          name: {
            $ne: productToExclude
          }
        }
      })
    }

    return Model.aggregate(config)
  }

  /**
   * Definir filtros de usuarios para la paginación
   * @param {Model: Object, limit: Number}
   */
  static setUsersFilters(filters) {
    if (!isObject(filters) || isEmptyObject(filters)) return {};

    const usersFilters = {};

    const { deleted, searchValue, excludeUserWithEmail } = filters;
    console.log('[users.filters]', filters)
    // Si se debe filtrar por usuarios eliminados o no
    if (isBoolean(deleted)) {
      Object.assign(usersFilters, {
        deleted: deleted
      })
    }

    // Si debe excluir un usuario con un "x" correo electrónico
    if (isString(excludeUserWithEmail) && !isEmptyString(excludeUserWithEmail)) {
      Object.assign(usersFilters, {
        email: {
          $ne: excludeUserWithEmail
        }
      })
    }

    // Si se debe filtrar por nombre de usuario y correo electrónico
    if (isString(searchValue) && !isEmptyString(searchValue)) {
      const value = { "$regex": new RegExp(searchValue.replace(/\W/g, '\\$&'), "gi"), }

      Object.assign(usersFilters, {
        $or: [
          { fullname: value },
          { email: value }
        ]
      })
    }

    return usersFilters;
  }

  /**
   * Setear filtros de productos para la paginación
   * @param {Model: Object, limit: Number}
   */
  static setProductsFilters(filters) {
    if (!isObject(filters)) return {};

    const productsFilters = {}
    const { name, stock, maxPrice, minPrice, date, categories } = filters;

    // Si se deben filtrar los productos por nombre
    if (name) {
      Object.assign(productsFilters, {
        name: {
          $options: "i",
          $regex: name,
        }
      })
    }

    // Si se deben filtrar los productos por categorías
    if (isArray(categories) && !isEmptyArray(categories)) {
      Object.assign(productsFilters, {
        categories: {
          $in: categories.map(category => ObjectId(category)),
        }
      })
    }

    // Si se deben filtrar los productos por stock
    if (stock) {
      Object.assign(productsFilters, {
        stock: stock
      });
    }

    // Si se deben filtrar los productos por precio máximo
    if (maxPrice) {
      const maxPriceConfig = {
        price: {
          $gte: 0,
          $lte: maxPrice
        }
      }

      if (minPrice) maxPriceConfig.price.$gte = minPrice;

      Object.assign(productsFilters, maxPriceConfig);
    }

    // Si se deben filtrar los productos por precio mínimo
    if (minPrice) {
      const minPriceConfig = {
        price: {
          $gte: minPrice,
          $lte: 9999,
        }
      }

      if (maxPrice) minPriceConfig.price.$lte = maxPrice;

      Object.assign(productsFilters, minPriceConfig);
    }

    // Si se deben filtrar los productos por fecha
    if (date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      Object.assign(productsFilters, {
        createdAt: {
          "$gte": date,
          "$lt": nextDay,
        }
      });
    }

    return productsFilters;
  }

  /**
   * Setear filtros de pedidos de clientes para la paginación
   * @param {Model: Object, limit: Number}
   */
  static setOrdersFilters(filters) {
    if (!isObject(filters)) return {};

    const ordersFilters = {}
    const { clientName } = filters;

    // Si se debe filtrar por nombre del cliente y del producto
    if (isString(clientName) && !isEmptyString(clientName)) {
      const value = { "$regex": new RegExp(clientName.replace(/\W/g, '\\$&'), "gi"), }

      Object.assign(ordersFilters, {
        clientName: value,
      });
    }

    return ordersFilters;
  }
}

module.exports = Pagination;
