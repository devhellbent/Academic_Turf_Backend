const express = require('express');
const router = express.Router();
const passport = require("passport");
const authController = require('../controllers/auth.controller');
// Login success route with JWT token



// In your auth.routes.js file
router.post('/google-login', authController.googleLogin);
router.post('/complete-google-signup', authController.completeGoogleSignup);

// Auth routes
router.post('/signup', authController.signup);
// router.post('/google', authController.googleAuth);
router.post('/signin', authController.signin);
router.post('/forgot-password', authController.forgotPassword);
router.get('/render', authController.renderResetForm);
router.post('/resetpassword/:token', authController.resetPassword);

module.exports = router;
