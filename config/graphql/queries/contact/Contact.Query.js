'use strict'

// Librarys
const { GraphQLString } = require('graphql')

// Models
const Contact = require('@models/contact')

// Typedefs
const ContactTypedef = require('@graphql/typedefs/contact/Contact.Typedef')

const contact = {
  type: ContactTypedef,
  async resolve() {
    try {
      const contact = await Contact.findOne({});
      return contact
    } catch (err) {
      console.error('[ContactQuery.error]', err)
    }
  },
}

module.exports = {
  contact
}
