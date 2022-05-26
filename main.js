'use strict'

const path = require('path')
const compression = require('compression')
const express = require('express')
const app = express()

// Configuración
require('dotenv').config()
require('module-alias/register')
require('@utils/cors')(app)
require('@services/cloudinary')
require('@graphql')(app)

// Base de datos
require('@database/connection')
require('@middlewares/user/createDefaultRoles')()

// Uso de Middlewares
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rutas de la API
require('@routes/api')(app)

// App en modo de desarrollo
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan')
  app.use(morgan('dev'))
}

// Definir puerto
const port = process.env.PORT || 4000

// Iniciar app en puerto definido
app.listen(port, function() {
  console.log('[INFO]', `The server is running on ${process.env.PUBLIC_URL}`)
})
