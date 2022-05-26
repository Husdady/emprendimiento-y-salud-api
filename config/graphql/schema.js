'use strict'

const queries = require('./queries')
const { GraphQLObjectType, GraphQLSchema } = require('graphql')

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: queries,
  }),
})
