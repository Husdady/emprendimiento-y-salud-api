// Reglas para crear un admin
exports.SchemaAdminCreation = {
  fullname: {
    type: String,
    required: 'You must provide a field "fullname"'
  },
  email: {
    type: String,
    required: 'You must provide a field "email"',
    isEmail: {
      message: 'You must provide a valid email'
    },
  },
  password: {
    type: String,
    required: 'You must provide a field "password"',
    min: {
      value: 8,
      message: 'Your password is too short'
    }
  },
  emptyBody: "You need to provide the user fields: 'fullname', 'email', etc."
}

// Reglas para crear un usuario
exports.SchemaUserCreation = {
  fullname: String,
  email: {
    type: String,
    isEmail: {
      message: 'You must provide a valid email',
    },
  },
  password: {
    type: String,
    min: {
      value: 8,
      message: 'Your password is too short',
    },
  },
  emptyBody: "You need to provide the user fields: 'fullname', 'email', etc.",
}

// Reglas para crear un nuevo producto
exports.SchemaProductCreation = {
  name: String,
  content: String,
  usageMode: String,
  description: String,
  emptyBody: "You need to provide the product fields: 'name', 'description', etc.",
}

// Reglas para crear un nuevo pedido
exports.SchemaOrderCreation = {
  clientId: String,
  clientName: String,
  clientPhone: String,
  emptyBody: "You need to provide the order product fields: 'clientName', 'clientPhone', etc."
}

// Reglas para crear un nuevo rol de usuario
exports.SchemaRoleCreation = {
  roleName: String,
  emptyBody: "You need to provide the role fields: 'roleName', 'permissions', etc.",
}
