'use strict'

const GraphQLSchema = require('./schema')
const { graphqlHTTP } = require('express-graphql')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')

module.exports = function(app) {
  app.post(
    '/api/graphql',
    verifySecretPassword('You do not have permissions to get this information'),
    graphqlHTTP(function(req) {
      return {
        rootValue: req,
        schema: GraphQLSchema,
        pretty: true,
        graphiql: process.env.NODE_ENV !== 'production',
      }
    })
  )
}