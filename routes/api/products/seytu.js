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
} = require('@controllers/products/Order.Controller')

// Models
const { SeytuOrders } = require("@models/products/Order");
const { SeytuProducts } = require("@models/products/Product");
const { SeytuCategories } = require("@models/products/Category");

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

const Seytu = {
  // Pedidos
  createOrder: createOrder(SeytuOrders),
  changeOrderStatus: changeOrderStatus(SeytuOrders),
  deleteProductOrder: deleteProductOrder(SeytuOrders),
  deleteClient: deleteClient(SeytuOrders),

  // Categorías
  editCategory: editCategory(SeytuCategories),
  createCategory: createCategory(SeytuCategories),
  deleteCategory: deleteCategory(SeytuCategories, SeytuProducts),
  
  // Productos 
  editProduct: editProduct(SeytuProducts),
  createProduct: createProduct(SeytuProducts),
  deleteProduct: deleteProduct(SeytuProducts, (deletedProduct) => {
    return `seytu.products/${deletedProduct.initialName}`
  }),
}

// Crear nueva categoría de los productos Seytu
router.post('/categories/add', verifyToken, Seytu.createCategory)

// Editar una categoría de los productos Seytu
router.put('/categories/:categoryId', verifyToken, Seytu.editCategory)

// Eliminar una categoría de los productos Seytu
router.delete('/categories/:categoryId', verifyToken, Seytu.deleteCategory)

// Crear nueva categoría de los productos Seytú
router.post(
  '/add-new-product',
  [verifyToken, permissionRequiredToCreateProducts],
  upload.array('productImages', 16),
  Seytu.createProduct,
  uploadMultipleImagesToCloudinary((product) => "seytu.products/" + product.initialName),
  uploadMultipleImages({
    Model: SeytuProducts,
    path: "images",
    extraFields: (images) => ({
      defaultImage: images[0]
    }),
    uploadError: (product) => {
      return "Ha ocurrido un error al subir las imágenes del producto " + "\"" + product.name + "\"";
    }
  }),
)

// Actualizar información de un producto Seytú
router.put(
  '/:productId',
  [verifyToken, permissionRequiredToEditProducts],
  upload.array('productImages', 16),
  Seytu.editProduct,
  uploadMultipleImagesToCloudinary((product) => "seytu.products/" + product.initialName),
  uploadMultipleImages({
    Model: SeytuProducts,
    path: "images",
    extraFields: (images) => ({
      defaultImage: images[0]
    }),
    uploadError: (product) => {
      return "Ha ocurrido un error al actualizar las imágenes del producto " + "\"" + product.name + "\"";
    }
  }),
)

// Eliminar una categoría de los productos Seytú
router.delete(
  '/:productId',
  [verifyToken, permissionRequiredToDeleteProducts],
  Seytu.deleteProduct
)

// Crear nuevo pedido de uno o varios productos Seytú
router.post(
  '/orders/new-order',
  verifySecretPassword('You do not have permissions to create an order of an Seytu product'),
  // [sendWhatsappMessage, Seytu.createOrder]
  Seytu.createOrder,
)

// Cambiar estado del pedido a "cancelado"
router.put(
  '/orders/:clientId/cancel/:productId',
  verifySecretPassword('You do not have permissions to cancel this order'),
  Seytu.changeOrderStatus("cancelled")
)

// Cambiar estado del pedido a "completado"
router.put(
  '/orders/:clientId/complete/:productId',
  verifySecretPassword('You do not have permissions to confirm this order'),
  Seytu.changeOrderStatus("completed")
)

// Eliminar pedido de un producto Seytú
router.delete(
  '/orders/:clientId/delete/:orderId',
  verifySecretPassword('You do not have permissions to delete this order'),
  Seytu.deleteProductOrder
)

// Eliminar cliente de un pedido
router.delete(
  '/orders/:clientId',
  verifyToken,
  verifySecretPassword('You do not have permissions to delete an client'),
  Seytu.deleteClient
)

module.exports = router
