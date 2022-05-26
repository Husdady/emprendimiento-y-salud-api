'use strict'

// Librarys
const { GraphQLList, GraphQLString } = require('graphql')

// Models
const { OmnilifeCategories } = require('@models/products/Category')

// Typedefs
const CategoryTypedef = require('@graphql/typedefs/products/Category.Typedef')

// Utils
const Pagination = require("@utils/Pagination");
const { setArguments } = require("@utils/Helper");

// Omnilife Category Query
const omnilife_category = {
  type: CategoryTypedef,
  args: setArguments({
    name: GraphQLString
  }),
  resolve(_, args) {
    try {
      return OmnilifeCategories.findOne(args).lean()
    } catch (err) {
      console.error('[OmnilifeQuery.category]', err)
    }
  },
}

// Omnilife Categories Query
const omnilife_categories = {
  type: new GraphQLList(CategoryTypedef),
  resolve(_, args) {
    try {
      return OmnilifeCategories.find(args).lean()
    } catch (err) {
      console.error('[OmnilifeQuery.categories]', err)
    }
  },
}

module.exports = {
  omnilife_category,
  omnilife_categories,
}
