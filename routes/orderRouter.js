const express = require('express');
const { newOrder, getSingleOrder, getAllOrders, myOrders, deleteOrder, updateOrder } = require('../controllers/orderControler');
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');


const router = express.Router();

// post new order on database 
router.route("/order/new").post(isAuthenticatedUser,newOrder);
// order details 
router.route("/order/:id")
.get(isAuthenticatedUser,authorizeRoles("admin"),getSingleOrder)

// get all orders by admin 

router.route("/admin/orders")
.get(isAuthenticatedUser,authorizeRoles("admin"),getAllOrders)

// get logged user orders 
router.route("/orders/me").get(isAuthenticatedUser,myOrders);

// delete or update orders by admin 
router.route("/admin/order/:id")
.delete(isAuthenticatedUser,authorizeRoles("admin"),deleteOrder)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateOrder);

module.exports = router;
