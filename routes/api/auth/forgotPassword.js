// Librarys
const { Router } = require('express')
const router = Router()

// Controllers
const {
	updateForgotPassword,
	sendPasswordConfirmation,
	verifyPasswordConfirmation,
} = require('@controllers/auth/Auth.Password.Controller')

// Middlewares
const { isValidToken } = require('@middlewares/auth/token')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')

// Enviar confirmación al correo electrónico de un usuario para actualizar su contraseña olvidada
router.post(
	'/recovery/password/send',
	verifySecretPassword(),
	sendPasswordConfirmation
)

// Actualizar contraseña olvidada de un usuario
router.post(
	'/recovery/password/update',
	verifySecretPassword(),
	updateForgotPassword,
)

// Verificar si aún es un código válido para actualizar la contraseña de un usuario
router.post(
	'/recovery/password/verify/confirmation',
	verifySecretPassword(),
	verifyPasswordConfirmation,
	isValidToken({ secretType: 'forgotPassword' })
)

module.exports = router
