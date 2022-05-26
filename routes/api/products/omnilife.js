// Librarys
const { Router } = require('express')
const router = Router()

// Controllers
const {
  editCategory,
  createCategory,
  deleteCategory,
} = require('@controllers/products/Category.Controller');
const {
  editProduct,
  createProduct,
  deleteProduct,
} = require('@controllers/products/Product.Controller')
const {
  createOrder,
  changeOrderStatus,
  deleteProductOrder,
  deleteClient,
  getTotalClientOrders,
} = require('@controllers/products/Order.Controller')

// Models
const { OmnilifeOrders } = require("@models/products/Order");
const { OmnilifeProducts } = require("@models/products/Product");
const { OmnilifeCategories } = require("@models/products/Category");

// Middlewares
const { verifyToken } = require('@middlewares/auth/token')
const verifyPermission = require('@middlewares/user/verifyPermission')
const verifySecretPassword = require('@middlewares/auth/verifySecretPassword')
const { uploadMultipleImages } = require('@middlewares/upload/Upload.Middleware')
const { uploadMultipleImagesToCloudinary } = require('@middlewares/upload/Upload.Cloudinary')

// Utils
const { upload } = require('@utils/multer')

// Verificar permiso para crear un producto
const permissionRequiredToCreateProducts = verifyPermission({
  action: 'crear productos',
  permission: 'createProducts',
})

// Verificar permiso para editar un producto
const permissionRequiredToEditProducts = verifyPermission({
  action: 'editar productos',
  permission: 'editProducts',
})

// Verificar permiso para eliminar un producto
const permissionRequiredToDeleteProducts = verifyPermission({
  action: 'eliminar productos',
  permission: 'deleteProducts',
})

const Omnilife = {
  // Pedidos
  createOrder: createOrder(OmnilifeOrders),
  changeOrderStatus: changeOrderStatus(OmnilifeOrders),
  deleteProductOrder: deleteProductOrder(OmnilifeOrders),
  deleteClient: deleteClient(OmnilifeOrders),
  getTotalClientOrders: getTotalClientOrders(OmnilifeOrders),

  // Categorías
  editCategory: editCategory(OmnilifeCategories),
  createCategory: createCategory(OmnilifeCategories),
  deleteCategory: deleteCategory(OmnilifeCategories, OmnilifeProducts),
  
  // Productos 
  editProduct: editProduct(OmnilifeProducts),
  createProduct: createProduct(OmnilifeProducts),
  deleteProduct: deleteProduct(OmnilifeProducts, (deletedProduct) => {
    return `omnilife.products/${deletedProduct.initialName}`
  }),
}

// Crear nueva categoría de los productos Omnilife
router.post('/categories/add', verifyToken, Omnilife.createCategory)

// Editar una categoría de los productos Omnilife
router.put('/categories/:categoryId', verifyToken, Omnilife.editCategory)

// Eliminar una categoría de los productos Omnilife
router.delete('/categories/:categoryId', verifyToken, Omnilife.deleteCategory)

// Crear nueva categoría de los productos Omnilife
router.post(
  '/add-new-product',
  verifySecretPassword('No tienes permisos para crear usuarios!'),
  [verifyToken, permissionRequiredToCreateProducts],
  upload.array('productImages', 16),
  Omnilife.createProduct,
  uploadMultipleImagesToCloudinary((product) => "omnilife.products/" + product.initialName),
  uploadMultipleImages({
    Model: OmnilifeProducts,
    path: "images",
    extraFields: (images) => ({
      defaultImage: images[0]
    }),
    uploadError: (product) => {
      return "Ha ocurrido un error al subir las imágenes del producto " + "\"" + product.name + "\"";
    }
  }),
)

// Actualizar información de un producto Omnilife
router.put(
  '/:productId',
  [verifyToken, permissionRequiredToEditProducts],
  upload.array('productImages', 16),
  Omnilife.editProduct,
  uploadMultipleImagesToCloudinary((product) => "omnilife.products/" + product.initialName),
  uploadMultipleImages({
    Model: OmnilifeProducts,
    path: "images",
    extraFields: (images) => ({
      defaultImage: images[0]
    }),
    uploadError: (product) => {
      return "Ha ocurrido un error al actualizar las imágenes del producto " + "\"" + product.name + "\"";
    }
  }),
)

// Eliminar un producto Omnilife
router.delete(
  '/:productId',
  [verifyToken, permissionRequiredToDeleteProducts],
  Omnilife.deleteProduct
)

// Obtener el total pedidos de un cliente
router.get(
  '/orders/:clientId/products/count',
  verifySecretPassword('You do not have permissions to get this information'),
  Omnilife.getTotalClientOrders
)

// Crear nuevo pedido de uno o varios productos Omnilife
router.post(
  '/orders/new-order',
  verifySecretPassword('You do not have permissions to create an order of an Omnilife product'),
  Omnilife.createOrder
  // [sendWhatsappMessage, Omnilife.createOrder]
)

// Cambiar estado del pedido a "cancelado"
router.put(
  '/orders/:clientId/cancel/:productId',
  verifySecretPassword('You do not have permissions to cancel this order'),
  Omnilife.changeOrderStatus("cancelled")
)

// Cambiar estado del pedido a "completado"
router.put(
  '/orders/:clientId/complete/:productId',
  verifySecretPassword('You do not have permissions to confirm this order'),
  Omnilife.changeOrderStatus("completed")
)

// Eliminar pedido de un producto Seytú
router.delete(
  '/orders/:clientId/delete/:orderId',
  verifySecretPassword('You do not have permissions to delete this order'),
  Omnilife.deleteProductOrder
)

router.delete(
  '/orders/:clientId',
  verifyToken,
  verifySecretPassword('You do not have permissions to delete an client'),
  Omnilife.deleteClient
)

module.exports = router
