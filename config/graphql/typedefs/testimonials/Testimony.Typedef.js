// Librarys
const { GraphQLDateTime } = require('graphql-iso-date')
const { GraphQLID, GraphQLInt, GraphQLString } = require('graphql')

// Utils
const { createGraphQLObjectType } = require('@utils/Helper')

// Author Photo Typedef
const AuthorPhotoTypedef = createGraphQLObjectType('AuthorPhotoTestimony', {
  url: GraphQLString,
  width: GraphQLString,
  height: GraphQLString,
})

// Author Typedef
const AuthorTypedef = createGraphQLObjectType('AuthorTestimony', {
  age: GraphQLString,
  name: GraphQLString,
  country: GraphQLString,
  short_name: GraphQLString,
  photo: AuthorPhotoTypedef,
})

// User Typedef
const TestimonyTypedef = createGraphQLObjectType('Testimony', {
  _id: GraphQLID,
  author: AuthorTypedef,
  testimony: GraphQLString,
  createdAt: GraphQLDateTime,
  updatedAt: GraphQLDateTime
})

// Testimony Sort By Typedef
const TestimonySortByTypedef = createGraphQLObjectType('TestimonySortBy', {
  createdAt: GraphQLInt,
}, "input")

module.exports = {
  TestimonyTypedef,
  TestimonySortByTypedef,
}
