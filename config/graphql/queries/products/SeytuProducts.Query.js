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
const { SeytuProducts } = require('@models/products/Product')
const { SeytuCategories } = require('@models/products/Category')

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

// Seytu Product Query
const seytu_product = {
  type: ProductTypedef,
  args: setArguments({
    _id: GraphQLID,
    name: GraphQLString,
  }),
  async resolve(_, args) {
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

      return SeytuProducts.findOneAndUpdate(config, update, extraConfig)
        .populate("categories")
        .lean();
    } catch (err) {
      console.error('[SeytuQuery.product]', err)
    }
  },
}

// Seytu Products Query
const seytu_products = {
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

      // Si se deben obtener los últimos productos Seytú
      if (getLastestProducts) {
        return getLastest({
          limit: limit,
          model: SeytuProducts,
        });
      }

      // Si se deben obtener los productos Seytú aleatoriamente
      if (getAleatoryProducts) {
        const aleatorySeytuProducts = await randomizeProducts({
          limit: limit,
          Model: SeytuProducts,
          productToExclude: filters.name,
        })

        return aleatorySeytuProducts;
      }

      // Si se debe paginar los productos Seytú
      if (pagination) {
        // Obtener filtros de productos
        const productsFilters = setProductsFilters(filters);

        // Paginar productos Seytú
        const seytuProducts = await paginate({
          skip: skip,
          limit: limit,
          filters: productsFilters,
          sortBy: filters.sortBy,
          model: SeytuProducts,
        });

        return seytuProducts;
      }

      return SeytuProducts.find(args).populate("categories").lean();
    } catch (err) {
      console.error('[SeytuQuery.products]', err)
    }
  },
}

// Seytu Products Pagination for table
const seytu_products_in_table = {
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

      // Paginar productos Seytú
      const seytuProducts = await paginate({
        filters: productsFilters,
        model: SeytuProducts,
        extraFields: {
          $lookup: {
            from: SeytuCategories.collection.name,
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

      return seytuProducts[0];
    } catch(err) {
      console.error('[SeytuQuery.products_in_table]', err)
    }
  }
}

module.exports = {
  seytu_product,
  seytu_products,
  seytu_products_in_table,
}
