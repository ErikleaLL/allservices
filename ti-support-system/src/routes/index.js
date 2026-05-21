const express = require('express');
const router = express.Router();

// 🌐 Rotas públicas
router.use('/', require('./publicRoutes'));

// 🔐 Rotas privadas
router.use('/auth', require('./authRoutes'));
router.use('/dashboard', require('./dashboardRoutes'));
router.use('/usuarios', require('./usuarioRoutes'));
router.use('/leads', require('./leadRoutes'));
router.use('/clientes', require('./clienteRoutes'));
router.use('/dispositivos', require('./dispositivoRoutes'));
router.use('/ordens', require('./ordemServicoRoutes'));
router.use('/estoque', require('./estoqueRoutes'));
router.use('/financeiro', require('./financeiroRoutes'));
router.use('/admin', require('./adminRoutes'));

// 404
router.use((req, res) => {
    res.status(404).send('Página não encontrada (404)');
});

module.exports = router;
