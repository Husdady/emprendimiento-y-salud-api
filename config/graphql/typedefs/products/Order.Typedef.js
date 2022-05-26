// Librarys
const { GraphQLDateTime } = require('graphql-iso-date')
const { GraphQLID, GraphQLInt, GraphQLString, GraphQLList } = require('graphql')

// Typedefs
const { ProductTypedef } = require('./Product.Typedef')

// Utils
const { createGraphQLObjectType } = require('@utils/Helper')

// Orders Filters Typedef
const OrderFiltersTypedef = createGraphQLObjectType('OrderFilters', {
  clientId: GraphQLString,
  clientName: GraphQLString,
  excludeFields: new GraphQLList(GraphQLString),
}, "input");

// Client Product Typedef
const ClientProductTypedef = createGraphQLObjectType('ClientProduct', {
  _id: GraphQLString,
  product: ProductTypedef,
  status: GraphQLString,
  totalCost: GraphQLInt,
  totalUnits: GraphQLInt,
  creationDate: GraphQLDateTime, 
  optionalMessage: GraphQLString,
});

// Client Orders Typedef
const ClientOrdersTypedef = createGraphQLObjectType('ClientOrders', {
  count: GraphQLInt,
  clientProducts: new GraphQLList(ClientProductTypedef)
})

// Order Typedef
const OrderTypedef = createGraphQLObjectType('Order', {
  _id: GraphQLID,
  clientId: GraphQLString,
  clientName: GraphQLString,
  clientPhone: GraphQLString,
  clientProduct: ClientProductTypedef,
  createdAt: GraphQLDateTime,
  updatedAt: GraphQLDateTime,
});

// Orders Typedef
const OrdersTypedef = createGraphQLObjectType('Orders', {
  count: GraphQLInt,
  items: new GraphQLList(OrderTypedef)
})

module.exports = {
  OrdersTypedef,
  OrderFiltersTypedef,
  ClientOrdersTypedef,
}
