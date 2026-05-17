const express = require('express');
const router = express.Router();

const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de dashboard exigem login
router.use(authMiddleware);

// Dashboard principal
router.get('/', dashboardController.index);

// Dashboard administrativo
router.get('/admin', dashboardController.admin);

// Dashboard técnico
router.get('/tecnico', dashboardController.tecnico);

// Dashboard cliente
router.get('/cliente', dashboardController.cliente);

module.exports = router;
