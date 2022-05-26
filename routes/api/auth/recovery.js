// Librarys
const { Router } = require('express')
const router = Router()

// Controllers
const {
	recoveryUserEmail,
	recoveryUserPassword,
	verifyUserSecretKey,
} = require('@controllers/auth/Auth.Recovery.Controller')

// Middlewares
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')

// Comprobar clave secreta del usuario
router.post(
	'/recovery/email/verify/secret-key',
	verifySecretPassword(),
	verifyUserSecretKey
)

// Comprobar clave secreta del usuario
router.post(
	'/recovery/email/:username/:secretKey',
	verifySecretPassword(),
	recoveryUserEmail
)

// Recuperar contraseña de un usuario
router.post(
	'/recovery/password',
	verifySecretPassword(),
	recoveryUserPassword,
)

module.exports = router
