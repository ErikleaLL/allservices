const express = require('express');
const router = express.Router();

const publicController = require('../controllers/publicController');
const dispositivoController = require('../controllers/dispositivoController');

// Landing Page
router.get('/', publicController.home);

// Páginas institucionais
router.get('/funcionalidades', publicController.funcionalidades);
router.get('/sobre', publicController.sobre);
router.get('/planos', publicController.planos);
router.get('/contato', publicController.contato);

// Capturar lead (formulário)
router.post('/lead', publicController.salvarLead);

// Página de obrigado
router.get('/obrigado', publicController.obrigado);

// 🎯 RASTREAMENTO PÚBLICO POR QR CODE
router.get('/rastreio/:qrcode', dispositivoController.rastreio);

module.exports = router;
