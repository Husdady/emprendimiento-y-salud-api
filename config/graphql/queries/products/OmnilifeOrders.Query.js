'use strict'

// Librarys
const { GraphQLList, GraphQLInt, GraphQLBoolean, GraphQLString } = require('graphql')

// Models
const { OmnilifeOrders } = require('@models/products/Order')
const { OmnilifeProducts } = require('@models/products/Product')

// Typedefs
const { OrdersTypedef, OrderFiltersTypedef, ClientOrdersTypedef } = require('@graphql/typedefs/products/Order.Typedef')

// Utils
const { setArguments } = require("@utils/Helper");
const { paginate, setOrdersFilters } = require("@utils/Pagination");

// Omnilife Orders Query
const omnilife_orders = {
  type: OrdersTypedef,
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    filters: OrderFiltersTypedef,
  }),
  async resolve(obj, args, ctx, info) {
    try {
      const sortBy = JSON.parse(obj.query.sortBy);
      const { skip, limit, pagination, filters } = args;

      // Si no está la paginación habilitada, retornar todos los pedidos
      if (!pagination) {
        return OmnilifeOrders.findOne({}).populate("clientProducts.product").lean()
      }

      // Obtener filtros de pedidos de clientes
      const ordersFilters = setOrdersFilters(filters);

      const omnilifeOrders = await paginate({
        filters: ordersFilters,
        model: OmnilifeOrders,
        extraFields: {
          $unwind: "$clientProducts",
          $lookup: {
            from: OmnilifeProducts.collection.name,
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
            items: [{ $sort: sortBy }, { $skip: skip }, { $limit: limit }],
          },
        }
      });
     
      const { count, items } = omnilifeOrders[0];

      return {
        count: count[0].count,
        items: items,
      }
    } catch (err) {
      console.error('[OmnilifeQuery.orders]', err)
    }
  },
}

// Omnilife Client Orders Query
const omnilife_client_orders = {
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

      // Si se debe paginar los pedidos de los productos Omnilife
      if (pagination) {
        const clientProductOrders = await paginate({
          filters: filters,
          model: OmnilifeOrders,
          extraFields: {
            $unwind: "$clientProducts",
            $lookup: {
              from: OmnilifeProducts.collection.name,
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
      }

      return OmnilifeOrders.findOne({ clientId }).populate("clientProducts.product").lean();
    } catch (err) {
      console.error('[OmnilifeQuery.clientOrders]', err)
    }
  },
}

module.exports = {
  omnilife_orders,
  omnilife_client_orders,
}
