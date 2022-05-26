'use strict'

// Librarys
const { GraphQLList, GraphQLString } = require('graphql')

// Models
const { SeytuCategories } = require('@models/products/Category')

// Typedefs
const CategoryTypedef = require('@graphql/typedefs/products/Category.Typedef')

// Utils
const Pagination = require("@utils/Pagination");
const { setArguments } = require("@utils/Helper");

// Seytu Category Query
const seytu_category = {
  type: CategoryTypedef,
  args: setArguments({
    name: GraphQLString
  }),
  resolve(_, args) {
    try {
      return SeytuCategories.findOne(args).lean()
    } catch (err) {
      console.error('[SeytuQuery.category]', err)
    }
  },
}

// Seytu Categories Query
const seytu_categories = {
  type: new GraphQLList(CategoryTypedef),
  resolve(_, args) {
    try {
      return SeytuCategories.find(args).lean()
    } catch (err) {
      console.error('[SeytuQuery.categories]', err)
    }
  },
}

module.exports = {
  seytu_category,
  seytu_categories,
}
