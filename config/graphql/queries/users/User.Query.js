'use strict'

// Librarys
const {
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql')

// Models
const Role = require('@models/users/Role')
const Users = require('@models/users/User')

// Typedefs
const { UserTypedef, UserFieldsTypedef, UserFiltersTypedef } = require('@graphql/typedefs/users/User.Typedef')

// Utils
const { isEmail } = require('@utils/Validations');
const { setArguments } = require("@utils/Helper");
const { paginate, setUsersFilters } = require("@utils/Pagination");

const user = {
  type: UserFieldsTypedef,
  args: setArguments({
    _id: GraphQLID,
  }),
  resolve(_, args) {
    try {
      return Users.findOne(args).populate('role').lean();
    } catch (err) {
      console.error('[UserQuery.user]', err)
    }
  },
}

const users = {
  type: UserTypedef,
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    filters: UserFiltersTypedef,
  }),
  async resolve(_, args, context, info) {
    try {
      const { skip, limit, pagination, filters } = args;

       // Si se debe paginar los usuarios
      if (pagination) {
          // Setear filtros de usuarios
          const usersFilters = setUsersFilters(filters);

          // Paginar usuarios
          const users = await paginate({
            filters: usersFilters,
            model: Users,
            extraFields: {
              $lookup: {
                from: Role.collection.name,
                localField: "role",
                foreignField: "_id",
                as: "role",
              },
              $unwind: "$role",
              $facet: {
                count: [{ $count: 'count' }],
                items: [{ $sort: filters.sortBy }, { $skip: skip }, { $limit: limit }],
              },
              $project: {
                count: { $arrayElemAt: ["$count.count", 0] },
                items: "$items",
              },
            }
          })
          .collation({ locale: 'en_US', strength: 1 });

        // Retornar usuarios paginados
        return users[0];
      }

      // Retornar usuarios
      return Users.find({}).populate("role").lean();
    } catch (err) {
      console.error('[UserQuery.users]', err)
    }
  },
}

module.exports = {
  user,
  users,
}
