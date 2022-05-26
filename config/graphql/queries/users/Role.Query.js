'use strict'

// Librarys
const { GraphQLString, GraphQLList } = require('graphql')

// Models
const Role = require('@models/users/Role')

// Typedefs
const RoleTypedef = require('@graphql/typedefs/users/Role.Typedef')

const role = {
  type: RoleTypedef,
  args: {
    name: {
      name: 'name',
      type: GraphQLString,
    },
  },
  resolve(_, args) {
    try {
      return Role.findOne(args).lean();
    } catch (err) {
      console.log("[getRole]", err);
    }
  },
}

const roles = {
  type: new GraphQLList(RoleTypedef),
  args: {
    name: {
      name: 'name',
      type: GraphQLString,
    },
  },
  resolve(_, args) {
    try {
      return Role.find(args).where('name').ne('Administrador').lean();
    } catch (err) {
      console.log("[getRoles]", err)
    }
  },
}

module.exports = {
  role,
  roles
}
