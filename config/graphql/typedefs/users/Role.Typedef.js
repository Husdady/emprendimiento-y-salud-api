// Librarys
const { GraphQLID, GraphQLBoolean, GraphQLString,  } = require('graphql')

// Utils
const Helper = require('@utils/Helper')

// Role Permissions Typedef
const RolePermissionsTypedef = Helper.createGraphQLObjectType('RolePermissions', {
  createUsers: GraphQLBoolean,
  editUsers: GraphQLBoolean,
  deleteUsers: GraphQLBoolean,
  restoreUsers: GraphQLBoolean,
  createRoles: GraphQLBoolean,
  editRoles: GraphQLBoolean,
  deleteRoles: GraphQLBoolean,
  createTestimonials: GraphQLBoolean,
  editTestimonials: GraphQLBoolean,
  deleteTestimonials: GraphQLBoolean,
  createProducts: GraphQLBoolean,
  editProducts: GraphQLBoolean,
  deleteProducts: GraphQLBoolean,
  affiliateClients: GraphQLBoolean,
  affiliateEntrepreneurs: GraphQLBoolean,
  editContactInformacion: GraphQLBoolean
})

// Role Typedef
const RoleTypedef = Helper.createGraphQLObjectType('Role', {
  _id: GraphQLID,
  name: GraphQLString,
  permissions: RolePermissionsTypedef
})

module.exports = RoleTypedef
