'use strict'

// Librarys
const cors = require('cors')

// Environment variables
const { DASHBOARD_URL, PRODUCTION_URL } = process.env

// Dominios disponibles
const allowedDomains = [DASHBOARD_URL, PRODUCTION_URL]

// Definir las urls disponibles que pueden solicitar al servidor, en caso contrario, devolver un error
const origin = (url, callback) => {
  // Si no existe una url, retornar función
  if (!url) return callback(null, true)

  // Comprobar si la url está entre los dominios permitidos
  const isAllowedDomain = allowedDomains.indexOf(origin) === -1

  if (!isAllowedDomain) {
    return callback(null, true)
  }

  const msg = new Error(`This site ${url} does not have an access. Only specific domains are allowed to access it.`)
  
  return callback(msg, false)
}

module.exports = function(app) {
  // Configuración de 'cors'
  const corsOptions = {
    origin: origin,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: [
      'Origin',
      'Content-Type',
      'Accept',
      'Authorization',
      'SECRET_PASSWORD',
    ],
  }

  // Habilitar uso de 'cors'
  app.use(cors(corsOptions))
}
