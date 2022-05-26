// Librarys
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const { GraphQLObjectType, GraphQLInputObjectType } = require('graphql')

module.exports = class Helper {
  /**
   * Encriptar contraseña
   * @param {password: String}
   * @returns
   */
  static async encryptPassword(password) {
    const salt = await bcrypt.genSalt(10)
    return bcrypt.hash(password, salt)
  }

  /**
   * Comparar contraseña
   * @param {password: String, userPassword: String}
   * @returns
   */
  static async comparePassword(password, userPassword) {
    return bcrypt.compare(password, userPassword)
  }

  /**
   * Crear token
   * @param {config: Object, expiresIn: Number}
   * @returns token
   */
  static createToken({ exp, data, secretType }) {
    const secrets = {
      login: process.env.JWT_SECRET_LOGIN,
      forgotPassword: process.env.JWT_SECRET_FORGOT_PASSWORD,
      emailConfirmation: process.env.JWT_SECRET_EMAIL_CONFIRMATION,
    }

    return jwt.sign(data, secrets[secretType], { expiresIn: exp })
  }

  /**
   * Crear objeto de GraphQl
   * @param {name: String, fields: Object}
   * @returns { Object }
   */
  static createGraphQLObjectType(name, fields, type) {
    const objectTypeFields = {}

    // Obtener los nombres de todos campo
    const objectFields = Object.keys(fields)

    // Iterar en cada campo
    for (const field of objectFields) {
      // Setear campo con su respecto 'type'
      objectTypeFields[field] = {
        type: fields[field]
      }
    }

    // Configuración del objeto
    const config = {
      name: name,
      fields: objectTypeFields
    }

    // Si es un objeto de entrada
    if (type === "input") {
      const graphQLInputObjectType = new GraphQLInputObjectType(config);
      return graphQLInputObjectType;
    }

    // Crear objeto de Graphql
    const graphQLObjectType = new GraphQLObjectType(config)

    // Retornar objeto
    return graphQLObjectType;
  }

  /**
   * Setear parámetros a query de GraphQl
   * @param {properties: Array}
   */
  static setArguments(properties) {
    const args = {}

    const keys = Object.keys(properties);

    for (let key of keys) {
      args[key] = {
        name: key,
        type: properties[key],
      }
    }

    return args;
  }

  /**
   * Obtener algunos campos de la imagen subida a Cloudinary
   * @param {image: Object}
   */
  static getSomeFieldsFromCloudinaryImage(image) {
    const public_id = image.public_id.split('/')

    return {
      _id: image.asset_id,
      url: image.secure_url,
      size: image.bytes,
      width: image.width,
      height: image.height,
      format: image.format,
      filename: image.filename,
      public_id: public_id[public_id.length - 1],
      cloudinary_path: image.cloudinary_path,
      created_at: image.created_at,
    }
  }
}
