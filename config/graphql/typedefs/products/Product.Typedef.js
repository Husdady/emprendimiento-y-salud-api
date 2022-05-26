// Librarys
const { GraphQLDateTime } = require('graphql-iso-date')
const { GraphQLID, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLList } = require('graphql')

// Typedefs
const CategoryTypedef = require('./Category.Typedef')

// Utils
const { createGraphQLObjectType } = require('@utils/Helper')

// Product Sort By Typedef
const ProductSortByTypedef = createGraphQLObjectType('ProductSortBy', {
  name: GraphQLInt,
  stock: GraphQLInt,
  price: GraphQLInt,
  totalVisits: GraphQLInt,
  createdAt: GraphQLInt,
  updatedAt: GraphQLInt,
}, "input")

// Product Filters Typedef
const ProductFiltersTypedef = createGraphQLObjectType('ProductFilters', {
  name: GraphQLString,
  stock: GraphQLInt,
  maxPrice: GraphQLInt,
  minPrice: GraphQLInt,
  date: GraphQLDateTime,
  sortBy: ProductSortByTypedef,
  categories: new GraphQLList(GraphQLID),
  excludeFields: new GraphQLList(GraphQLString),
}, "input");

// Product Benefit Typedef
const ProductBenefitTypedef = createGraphQLObjectType('ProductBenefit', {
  _id: GraphQLID,
  benefit: GraphQLString,
})

// Product Image Typedef
const ProductImageTypedef = createGraphQLObjectType('ProductDefaultImage', {
  _id: GraphQLID,
  public_id: GraphQLID,
  url: GraphQLString,
  size: GraphQLFloat,
  width: GraphQLFloat,
  height: GraphQLFloat,
  format: GraphQLString,
  filename: GraphQLString,
  cloudinary_path: GraphQLString,
})

// Product Typedef
const ProductTypedef = createGraphQLObjectType('Product', {
  _id: GraphQLID,
  price: GraphQLFloat,
  stock: GraphQLFloat,
  name: GraphQLString,
  content: GraphQLString,
  totalVisits: GraphQLInt,
  usageMode: GraphQLString,
  description: GraphQLString,
  defaultImage: ProductImageTypedef,
  images: new GraphQLList(ProductImageTypedef),
  categories: new GraphQLList(CategoryTypedef),
  benefits: new GraphQLList(ProductBenefitTypedef),
  createdAt: GraphQLDateTime,
  updatedAt: GraphQLDateTime,
});

const ProductTableTypedef = createGraphQLObjectType('ProductTable', {
  count: GraphQLInt,
  items: new GraphQLList(ProductTypedef),
});

module.exports = {
  ProductTypedef,
  ProductFiltersTypedef,
  ProductTableTypedef,
};
