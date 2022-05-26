'use strict'

// Librarys
const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
  GraphQLBoolean,
} = require('graphql')

// Models
const Testimonials = require('@models/testimonials/Testimony')

// Typedefs
const { TestimonyTypedef, TestimonySortByTypedef } = require('@graphql/typedefs/testimonials/Testimony.Typedef')

// Utils
const { setArguments } = require("@utils/Helper");
const { paginate, getLastest } = require("@utils/Pagination");

const author_testimony = {
  type: TestimonyTypedef,
  args: setArguments({
    name: GraphQLString
  }),
  async resolve(_, args) {
    try {
      const testimony = await Testimonials.findOne({
        'author.short_name': args.name
      })
      .lean()

      return testimony;
    } catch (err) {
      console.error('[TestimonyQuery.testimony]', err)
    }
  },
}

const testimonials = {
  type: new GraphQLList(TestimonyTypedef),
  args: setArguments({
    skip: GraphQLInt,
    limit: GraphQLInt,
    pagination: GraphQLBoolean,
    getLastestTestimonials: GraphQLBoolean,
    sortBy: TestimonySortByTypedef,
  }),
  async resolve(_, args) {
    const { skip, limit, sortBy, pagination, getLastestTestimonials } = args;

    try {
      if (pagination && getLastestTestimonials) return null;

      // Si se deben obtener los últimos testimonios Omnilife
      if (getLastestTestimonials) {
        const lastestTestimonials = await getLastest({
          limit: limit,
          model: Testimonials,
        });

        return lastestTestimonials;
      }

      // Si se debe paginar los testimonios
      if (pagination) {
        const paginatedTestimonials = await paginate({
          skip: skip,
          limit: limit,
          sortBy: sortBy,
          model: Testimonials,
        })

        return paginatedTestimonials;
      }

      // Retornar testimonios
      return Testimonials.find({}).lean();
    } catch (err) {
      console.error('[TestimonyQuery.testimonials]', err)
    }
  },
}

module.exports = {
  author_testimony,
  testimonials,
}
