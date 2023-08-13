const express = require('express');
const {
    registerUser,
    loginUser,
    logout,
    forgotPassword,
    resetPassword,
    getUserDetails,
    updatePassword,
    updateProfile,
    getAllUsers,
    getAllUser,
    updateUserRole,
    deleteUser } = require('../controllers/userController');
const {
    isAuthenticatedUser,
    authorizeRoles } = require('../middleware/auth');

const router = express.Router();
// register user 
router.route("/register").post(registerUser);

// login user 
router.route("/login").post(loginUser);

// forgot password 

router.route("/password/forgot").post(forgotPassword);

router.route("/logout").get(logout);
// reset password
router.route("/password/reset/:token").put(resetPassword);
// get user details 
router.route("/me").get(isAuthenticatedUser, getUserDetails);
// update password 
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
// update profile
router.route("/me/updateProfile").put(isAuthenticatedUser, updateProfile);

// get all user by admin 
router.route("/admin/users").get(isAuthenticatedUser, authorizeRoles("admin"), getAllUsers);

// get a single user 
router.route("/admin/user/:id")
.get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser)
.put(isAuthenticatedUser,authorizeRoles("admin"),updateUserRole)
.delete(isAuthenticatedUser ,authorizeRoles("admin"),deleteUser);

// update user role 

// router.route("/admin/user/:id").put(isAuthenticatedUser, authorizeRoles("admin"), updateUserRole);

// delete user 

router.route("/admin/user/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);
module.exports = router;