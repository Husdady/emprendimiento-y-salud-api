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


// Avatar Settings User Typedef
const AvatarTypedef = createGraphQLObjectType('UserSettingsAvatar', {
  url: GraphQLString,
  width: GraphQLString,
  heigth: GraphQLString,
})

// Settings User Typedef
const SettingsTypedef = createGraphQLObjectType('UserSettings', {
  theme: GraphQLString,
  avatar: AvatarTypedef,
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
  settings: SettingsTypedef,
  deleted: GraphQLBoolean,
  verifyEmail: GraphQLBoolean,
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
