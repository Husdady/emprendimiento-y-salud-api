// Endpoints
const signUp = require('./sign_up')
const signIn = require('./sign_in')
const recovery = require('./recovery')
const account = require('./account')
const emailConfirmation = require('./emailConfirmation')
const forgotPassword = require('./forgotPassword')

// Enrutar endpoints
const endpoints = [
  signUp,
  signIn,
  recovery,
  account,
  emailConfirmation,
  forgotPassword,
]

module.exports = endpoints
