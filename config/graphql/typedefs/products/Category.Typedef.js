// Librarys
const { GraphQLID, GraphQLString } = require('graphql')

// Utils
const { createGraphQLObjectType } = require('@utils/Helper')

// Category Typedef
const CategoryTypedef = createGraphQLObjectType('Category', {
  _id: GraphQLID,
  name: GraphQLString,
})

module.exports = CategoryTypedef
