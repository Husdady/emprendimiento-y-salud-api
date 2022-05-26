// Librarys
const { Router } = require('express')
const router = Router()

// Middlewares
const { verifyToken, isValidToken } = require('@middlewares/auth/token')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')

// Controllers
const AuthAccountController = require('@controllers/auth/Auth.Account.Controller')

// Verificar token al iniciar sesión un usuario en su cuenta
router.get(
	'/verifyToken',
	verifySecretPassword(),
	isValidToken({ secretType: 'login' })
)

// Verificar cuenta de un usuario
router.post(
	'/account/verifyAccount',
	verifySecretPassword(),
	AuthAccountController.verifyAccount,
)

// Cerrar cuenta de un usuario
router.delete(
  '/account/close-my-account',
  [verifySecretPassword(), verifyToken],
  AuthAccountController.closeMyAccount,
)

module.exports = router
