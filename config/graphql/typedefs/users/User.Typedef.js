// Librarys
const { GraphQLDateTime } = require('graphql-iso-date')
const {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql')

// Utils
const { createGraphQLObjectType } = require('@utils/Helper')

// User Sort By Typedef
const UserSortByTypedef = createGraphQLObjectType('UserSortBy', {
  fullname: GraphQLInt,
  email: GraphQLInt,
  updatedAt: GraphQLInt,
  createdAt: GraphQLInt,
  deletedAt: GraphQLInt,
}, "input")

// User Filters Typedef
const UserFiltersTypedef = createGraphQLObjectType('UserFilters', {
  searchValue: GraphQLString,
  deleted: GraphQLBoolean,
  excludeUserWithEmail: GraphQLString,
  excludeFields: new GraphQLList(GraphQLString),
  sortBy: UserSortByTypedef,
}, "input");


// Profile Photo User Typedef
const ProfilePhotoTypedef = createGraphQLObjectType('UserProfilePhoto', {
  url: GraphQLString,
  width: GraphQLString,
  heigth: GraphQLString,
})

// Settings User Typedef
const RoleTypedef = createGraphQLObjectType('UserRole', {
  name: GraphQLString,
})

// User Typedef
const UserFieldsTypedef = createGraphQLObjectType('UserFields', {
  _id: GraphQLID,
  fullname: GraphQLString,
  email: GraphQLString,
  role: RoleTypedef,
  profilePhoto: ProfilePhotoTypedef,
  deleted: GraphQLBoolean,
  verifiedEmail: GraphQLBoolean,
  secretKey: GraphQLString,
  emailConfirmation: GraphQLString,
  passwordConfirmation: GraphQLString,
  deletedAt: GraphQLDateTime,
  createdAt: GraphQLDateTime,
  updatedAt: GraphQLDateTime,
})

const UserTypedef = createGraphQLObjectType('User', {
  count: GraphQLInt,
  items: new GraphQLList(UserFieldsTypedef)
})

module.exports = {
  UserTypedef,
  UserFieldsTypedef,
  UserFiltersTypedef,
}
