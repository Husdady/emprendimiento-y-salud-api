// Librarys
const { Router } = require('express')
const router = Router()

// Middlewares
const { isValidToken } = require('@middlewares/auth/token')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')

// Controllers
const { verifyIfExistUserEmail, sendEmailConfirmation } = require('@controllers/auth/Auth.Email.Controller')

// Verificar token al iniciar sesión un usuario en su cuenta
router.get(
	'/email/verifyConfirmationCode',
	verifySecretPassword(),
	isValidToken({ secretType: 'emailConfirmation' })
)

// Comprobar si existe el correo electrónico de usuario para enviar una confirmación
router.post(
	'/email/verifyUserEmail',
	verifySecretPassword(),
	verifyIfExistUserEmail
)

// Enviar un verififación de correo electrónico
router.post(
	'/email/send/:userEmail',
	verifySecretPassword(),
	sendEmailConfirmation
)

module.exports = router
