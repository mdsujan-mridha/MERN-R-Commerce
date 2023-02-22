const express = require('express');
const { getAllProducts,createProduct, updateProduct, deleteProduct, getAllProductDetails } = require('../controllers/productController');
const { isAuthenticatedUser,authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// get all products api 
router.route("/products").get(getAllProducts);
// create product api 
router.route("/product/new").post(isAuthenticatedUser,
    authorizeRoles("admin"),
    createProduct);

// update product API 
router
.route("/product/:id")
.put(isAuthenticatedUser,authorizeRoles("admin"),updateProduct)
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteProduct)
.get(isAuthenticatedUser,authorizeRoles("admin"),getAllProductDetails);

module.exports = router;