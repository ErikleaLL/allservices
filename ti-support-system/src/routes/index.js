const express = require('express');
const router = express.Router();

// 🌐 Rotas públicas (landing page)
router.use('/', require('./publicRoutes'));

// 🔐 Rotas privadas
router.use('/auth', require('./authRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/usuarios', require('./usuarioRoutes'));
router.use('/leads', require('./leadRoutes'));
router.use('/clientes', require('./clienteRoutes'));

// Rota 404
router.use((req, res) => {
    res.status(404).send('Página não encontrada (404)');
});

module.exports = router;
