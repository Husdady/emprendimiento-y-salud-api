'use strict'

// Librarys
const {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql')

// Models
const { OmnilifeProducts } = require('@models/products/Product')
const { OmnilifeCategories } = require('@models/products/Category')

// Typedefs
const { ProductTypedef, ProductFiltersTypedef, ProductTableTypedef } = require('@graphql/typedefs/products/Product.Typedef')

// Utils
const { setArguments } = require("@utils/Helper");
const {
  paginate,
  getLastest,
  randomizeProducts,
  setProductsFilters,
} = require("@utils/Pagination");

// Omnilife Product Query
const omnilife_product = {
  type: ProductTypedef,
  args: setArguments({
    _id: GraphQLID,
    name: GraphQLString,
  }),
  resolve(_, args) {
    try {
      const config = {}

      if (args._id) {
        config._id = args._id
      }

      if (args.name) {
        config.name = {
          $regex: new RegExp(args.name.replace(/\W/g, '\\$&'), "gi"),
        }
      }

      // Aumentar número de visitas del producto
      const update = {
        $inc: {
          totalVisits: 1
      }}

      // Configuración extra
      const extraConfig = {
        new: true,
      }

      return OmnilifeProducts.findOneAndUpdate(config, update, extraConfig)
        .populate("categories")
        .lean();
    } catch (err) {
      console.error('[OmnilifeQuery.product]', err)
    }
  },
}

// Omnilife Products Query
const omnilife_products = {
  type: new GraphQLList(ProductTypedef),
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    getLastestProducts: GraphQLBoolean,
    getAleatoryProducts: GraphQLBoolean,
    filters: ProductFiltersTypedef,
  }),
  async resolve(_, args) {
    try {
      const {
        skip,
        limit,
        filters,
        pagination,
        getLastestProducts,
        getAleatoryProducts,
      } = args;

      // Si se deben obtener los últimos productos Omnilife
      if (getLastestProducts) {
        return getLastest({
          limit: limit,
          model: OmnilifeProducts,
        });
      }

      // Si se deben obtener los productos Omnilife aleatoriamente
      if (getAleatoryProducts) {
        const aleatoryOmnilifeProducts = await randomizeProducts({
          limit: limit,
          Model: OmnilifeProducts,
          productToExclude: filters.name,
        })

        return aleatoryOmnilifeProducts;
      }

      // Si se debe paginar los productos Omnilife
      if (pagination) {
        // Obtener filtros de productos
        const productsFilters = setProductsFilters(filters);

        // Paginar productos Omnilife
        const omnilifeProducts = await paginate({
          skip: skip,
          limit: limit,
          filters: productsFilters,
          sortBy: filters.sortBy,
          model: OmnilifeProducts,
        });
        
        return omnilifeProducts;
      }

      // Retornar productos Omnilife
      return OmnilifeProducts.find({}).populate("categories").lean();
    } catch (err) {
      console.error('[OmnilifeQuery.products]', err)
    }
  },
}

// Omnilife Products Pagination for table
const omnilife_products_in_table = {
  type: ProductTableTypedef,
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    filters: ProductFiltersTypedef,
  }),
  async resolve(_, args) {
    try {
      const { skip, limit, filters, pagination } = args;

      // Si la paginación no está habilitada
      if (!pagination) return OmnilifeProducts.find({}).populate("categories").lean();

      // Obtener filtros de productos
      const productsFilters = setProductsFilters(filters);

      // Paginar productos Omnilife
      const omnilifeProducts = await paginate({
        filters: productsFilters,
        model: OmnilifeProducts,
        extraFields: {
          $lookup: {
            from: OmnilifeCategories.collection.name,
            localField: "categories",
            foreignField: "_id",
            as: "categories",
          },
          $facet: {
            count: [{ $count: 'count' }],
            items: [{ $sort: filters.sortBy }, { $skip: skip }, { $limit: limit }],
          },
          $project: {
            count: { $arrayElemAt: ["$count.count", 0] },
            items: "$items",
          },
        }
      });

      return omnilifeProducts[0];
    } catch(err) {
      console.error('[OmnilifeQuery.products_in_table]', err)
    }
  }
}

module.exports = {
  omnilife_product,
  omnilife_products,
  omnilife_products_in_table,
}
