const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// Tela de login
router.get('/login', authController.showLogin);

// Processar login
router.post('/login', authController.login);

// Tela de registro
router.get('/register', authController.showRegister);

// Processar registro
router.post('/register', authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
