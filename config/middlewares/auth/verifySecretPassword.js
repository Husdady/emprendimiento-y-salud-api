// Utils
const { Validations } = require('@utils/Validations')

const defaultMessage = 'Error &%%%10&&&21, ha ocurrido un error en el servidor'

// Comprobar si existe la clave secreta
module.exports = function verifySecretPassword(erroMessage = defaultMessage) {
	return async (req, res, next) => {
		Validations.validateSecretPassword({
	    secret_password: req.headers.secret_password,
	    onEqual: next,
	    onDifferent: function() {
	      return res.status(401).json({
	        message: erroMessage
	      })
	    }
	  })
	}
}