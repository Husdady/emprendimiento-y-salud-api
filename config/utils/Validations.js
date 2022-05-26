// Comprobar si es un string
function isString(string) {
  return typeof string === 'string'
}

// Comprobar si es un string vacío
function isEmptyString(string) {
  return typeof string === 'string' && string.length === 0
}

// Comprobar si es un número
function isNumber(number) {
  return typeof number === 'number'
}

// Comprobar si es un valor booleano
function isBoolean(data) {
  return typeof data === 'boolean'
}

// Comprobar si es una función
function isFunction(func) {
  return typeof func === 'function'
}

// Comprobar si es un arreglo
function isArray(array) {
  return Array.isArray(array)
}

// Comprobar si es un arreglo vacío
function isEmptyArray(array) {
  if (!isArray(array)) return false;
  return array.length === 0;
}

// Comprobar si es un número
function isUndefined(data) {
  return typeof data === 'undefined'
}

// Comprobar si es un objeto
function isObject(obj) {
  if (!obj) return false;

  return typeof obj === 'object'
}

// Comprobar si es un objeto vacío
function isEmptyObject(obj) {
  return Object.keys(obj).length === 0
}

// Comprobar si la longitud de un string es menor que el valor asignado
function isLessThan({ value, min }) {
  return isString(value) && isNumber(min) && value.length < min
}

// Comprobar si es un correo electrónico
function isEmail(email) {
  let isValidEmail = null,
    verifyEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  if (verifyEmail.test(email)) {
    isValidEmail = true
  } else {
    isValidEmail = false
  }
  return isValidEmail
}

class Validations {
  /**
   *
   * @param {schema: Object}
   * @returns
   */
  static validateSchema(schema) {
    return (body) => {
      try {
        // Si no se han asignado campos al body
        if (isEmptyObject(body)) {
          throw new Error(schema.emptyBody)
        }
        
        for (const field of Object.keys(schema)) {
          // Obtener la propiedad required de cada campo del esquema
          const SchemaRequired = !isString(schema[field]) || schema[field].required

          // Validar si tiene la propiedad 'required'
          if (SchemaRequired) {
            const SchemaRequiredError = schema[field].required || `You must provide a field "${field}"`
            
            // Comprobar si no existe los campos establecidos en el esquema dentro del body y también si es un string vacío
            if (!body[field] || isEmptyString(body[field])) throw new Error(SchemaRequiredError)
          }

          // Obtener la propiedad isEmail de cada campo del esquema
          const SchemaIsEmail = schema[field].isEmail
          // Verificar si existe la propiedad
          if (SchemaIsEmail) {
            // Sino es un correo válido
            if (!isEmail(body[field])) throw new Error(SchemaIsEmail.message)
          }

          // Obtener la propiedad min de cada campo del esquema
          const SchemaMin = schema[field].min
          // Verificar si existe la propiedad
          if (SchemaMin) {
            // Sino es una contraseña corta
            const isShortPassword = isLessThan({
              value: body[field],
              min: SchemaMin.value,
            })
            if (isShortPassword) throw new Error(SchemaMin.message)
          }
        }

        // Recorrer el body y obtener sus propiedades
        for (const value of Object.keys(body)) {
          // Si no es la propiedad 'emptyBody' y si existe propiedad definida en el esquema
          if (!isString(schema[value]) && schema[value]) {
            // Obtener el tipo de dato de la propiedad del esquema
            const SchemaType =  schema[value].type || schema[value]
            // Si no existe la propiedad type
            if (!SchemaType) throw new Error('You need to provide what kind of value it is')
            // Obtener el nombre del constructor de un Objeto
            const type = new SchemaType().constructor.name
            // Si el tipo de dato de la propiedad del body no es igual al tipo establecido
            if (typeof body[value] !== type.toLowerCase()) {
              throw new Error(`The property value '${value}' must be of type ${type}`)
            }
          }
        }

        return {}
      } catch (error) {
        return error && { error: error.message }
      }
    }
  }
  /**
   *
   * @param {secretPassword: String}
   * @returns
   */
  static validateSecretPassword({ onEqual, onDifferent, secret_password }) {
    // Comprobar si existe la clave secreta
    if (secret_password === process.env.SECRET_PASSWORD) {
      isFunction(onEqual) && onEqual()
    } else {
      isFunction(onDifferent) && onDifferent()
    }
  }
}

module.exports = {
  Validations,
  isString,
  isEmptyString,
  isNumber,
  isBoolean,
  isFunction,
  isArray,
  isEmptyArray,
  isUndefined,
  isObject,
  isEmptyObject,
  isEmail,
}
