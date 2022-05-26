'use strict'

// Librarys
const { GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLString } = require('graphql')

// Models
const { SeytuOrders } = require('@models/products/Order')
const { SeytuProducts } = require('@models/products/Product')

// Typedefs
const { OrdersTypedef, OrderFiltersTypedef, ClientOrdersTypedef } = require('@graphql/typedefs/products/Order.Typedef')

// Utils
const { paginate } = require("@utils/Pagination");
const { setArguments } = require("@utils/Helper");

// Seytu Orders Query
const seytu_orders = {
  type: OrdersTypedef,
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    filters: OrderFiltersTypedef,
  }),
  async resolve(_, args) {
    try {
      const { skip, limit, pagination, filters } = args;

      // Si no está la paginación habilitada, retornar todos los pedidos
      if (!pagination) {
        return SeytuOrders.findOne({}).populate("clientProducts.product").lean()
      }

      const seytuOrders = await paginate({
        model: OmnilifeOrders,
        extraFields: {
          $unwind: "$clientProducts",
          $lookup: {
            from: SeytuProducts.collection.name,
            localField: "clientProducts.product",
            foreignField: "_id",
            as: 'clientProducts.product'
          },
          $project: {
            clientId: "$clientId",
            clientName: "$clientName",
            clientPhone: "$clientPhone",
            clientProduct: {
              status: "$clientProducts.status",
              totalUnits: "$clientProducts.totalUnits",
              creationDate: "$clientProducts.creationDate",
              product: { $arrayElemAt: ["$clientProducts.product", 0] },
            },
          },
          $facet: {
            count: [{ $count: 'count' }],
            items: [{ $skip: skip }, { $limit: limit }],
          },
        }
      });

      const { count, items } = seytuOrders[0];

      return {
        count: count[0].count,
        items: items,
      }
    } catch (err) {
      console.error('[SeytuQuery.orders]', err)
    }
  },
}

// Seytu Client Orders Query
const seytu_client_orders = {
  type: ClientOrdersTypedef,
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    filters: OrderFiltersTypedef,
  }),
  async resolve(_, args) {
    try {
      const { skip, limit, pagination, filters } = args;

      // Si la paginación no está habilitada, retornar todos los pedidos de un cliente
      if (!pagination) {
        return SeytuOrders.findOne({ clientId }).populate("clientProducts.product").lean();
      }

      // Paginar pedidos de un cliente Seytú
      const clientProductOrders = await paginate({
        filters: filters,
        model: SeytuOrders,
        extraFields: {
          $unwind: "$clientProducts",
          $lookup: {
            from: SeytuProducts.collection.name,
            localField: "clientProducts.product",
            foreignField: "_id",
            as: 'clientProducts.product'
          },
          $facet: {
            count: [{ $count: 'count' }],
            items: [{ $skip: skip }, { $limit: limit }],
          },
          $project: {
            _id: 0,
            count: { $arrayElemAt: ["$count.count", 0] },
            clientProducts: "$items.clientProducts",
          },
        }
      });

      const { count, clientProducts } = clientProductOrders[0];

      return {
        count: count,
        clientProducts: clientProducts.map(clientProduct => ({
          ...clientProduct,
          product: clientProduct.product[0],
        }))
      }
    } catch (err) {
      console.error('[SeytuQuery.clientOrders]', err)
    }
  },
}

module.exports = {
  seytu_orders,
  seytu_client_orders,
}
