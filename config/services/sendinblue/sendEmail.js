// Sendinblue config
const { sender, transport } = require('./config')

// Env variables
const { ORIGIN, APP_NAME } = process.env

// Enviar una confirmación por correo electrónico a un usuario que ha creado un cuenta en la aplicación
exports.sendEmailConfirmation = async function({ user, confirmationCode }) {
  const to = [{ email: user.email }]
  const confirmationLink = `${ORIGIN}/auth/email/success/confirmation${confirmationCode.replace(/\@/g, '%40')}`

  try {
    await transport.sendTransacEmail({
      to: to,
      sender: sender,
      subject: "Por favor confirma tu cuenta",
      htmlContent: `<h2>Confirmación de correo electrónico | ${APP_NAME}</h2>
        <h4>¡Hola ${user.fullname}! ¿Cómo estás?</h4>
        <p>Gracias por crear una cuenta en ${APP_NAME}. A continuación deberás confirmar tu correo electrónico clickeando en el siguiente enlace:</p>
        <a href="${confirmationLink}">Confirmar mi cuenta</a>
        <p>En caso, no funcione el enlace de arriba, por favor copia el siguiente enlace: <code>${confirmationLink}</code> y pégalo en una nueva pestaña de tu navegador.</p>
        <p>Si tienes problemas en confirmar tu cuenta, no dudes en dejarnos un mensaje por este medio.</p>`,
    })

    return confirmationLink
  } catch(error) {
    throw new Error(error)
  }
};

// Enviar una confirmación por correo electrónico a un usuario para actualizar tu contraseña
exports.sendPasswordConfirmation = async function({ user, confirmationCode }) {
  const to = [{ email: user.email }]
  const confirmationLink = `${ORIGIN}/auth/password/recovery${confirmationCode.replace(/\@/g, '%40')}`

  try {
    await transport.sendTransacEmail({
      to: to,
      sender: sender,
      subject: "Contraseña olvidada",
      htmlContent: `<h2>Actualizar contraseña olvidada | ${APP_NAME}</h2>
          <h4>¡Hola ${user.fullname}! ¿Cómo estás?</h4>
          <p>Hemos descubierto que has olvidado tu contraseña, por eso te hemos enviado este mensaje para que puedas actualizarla.</p>
          <a href="${confirmationLink}">Actualizar mi contraseña</a>
          <p>En caso, no funcione el enlace de arriba, por favor copia el siguiente enlace: <code>${confirmationLink}</code> y pégalo en una nueva pestaña de tu navegador.</p>
          <p>Si tienes problemas para actualizar tu contraseña, no dudes en dejarnos un mensaje por este medio.</p>`,
    })

    return confirmationLink
  } catch(error) {
    throw new Error(error)
  }
};

