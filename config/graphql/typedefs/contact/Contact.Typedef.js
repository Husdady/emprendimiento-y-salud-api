// Librarys
const { GraphQLString, GraphQLList } = require('graphql')

// Utils
const Helper = require('@utils/Helper')

// Contact Social Network Typedef
function getSocialNetwork(social) {
  const ContactSocialNetworkTypedef = Helper.createGraphQLObjectType('ContactSocialNetwork' + social, {
    _id: GraphQLString,
    nameOfThePage: GraphQLString,
    linkOfThePage: GraphQLString,
  })

  return new GraphQLList(ContactSocialNetworkTypedef)
}

// Contact Emails Typedef
const ContactSocialNetworksTypedef = Helper.createGraphQLObjectType('ContactSocialNetworks', {
  twitter: getSocialNetwork('Twitter'),
  instagram: getSocialNetwork('Instagram'),
  facebook: getSocialNetwork('Facebook')
})

// Contact Photo Typedef
const ContactPhotoTypedef = Helper.createGraphQLObjectType('ContactPhoto', {
  url: GraphQLString,
  width: GraphQLString,
  heigth: GraphQLString,
})

// Contact Typedef
const ContactTypedef = Helper.createGraphQLObjectType('Contact', {
  fullname: GraphQLString,
  aboutMe: GraphQLString,
  testimony: GraphQLString,
  phone: GraphQLString,
  omnilifeCode: GraphQLString,
  emails: new GraphQLList(GraphQLString),
  socialNetworks: ContactSocialNetworksTypedef,
  contactPhoto: ContactPhotoTypedef,
})

module.exports = ContactTypedef
