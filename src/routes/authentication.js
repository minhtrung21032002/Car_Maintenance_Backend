const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');


//Login
router.get('/login', authController.normalLogin)
router.post('/login', authController.normalLoginProcess)


//Register
router.get('/register', authController.normalRegister)
router.post('/register', authController.normalRegisterProcess)

//Register
router.get('/login/admin', authController.adminLogin)
router.post('/login/admin', authController.adminLoginProcess)


module.exports = router;