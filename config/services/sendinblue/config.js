// Librarys
const SibApiV3Sdk = require('sib-api-v3-sdk')

// Credentials
const { APP_NAME, SENDINBLUE_SENDER, SENDINBLUE_API_KEY } = require('./credentials')

// Crear cliente
const defaultClient = SibApiV3Sdk.ApiClient.instance

// Definir la API_KEY
const newApiKey = defaultClient.authentications['api-key']

// Setear la API_KEY que nos provee Sendinblue
newApiKey.apiKey = SENDINBLUE_API_KEY

// Definir el sender por defecto
const defaultSender = {
	name: APP_NAME,
	email: SENDINBLUE_SENDER,
}

// Crear nuevo transporte
const transport = new SibApiV3Sdk.TransactionalEmailsApi()

exports.transport = transport
exports.sender = defaultSender
