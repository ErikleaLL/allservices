const express = require('express');
const router = express.Router();

const publicController = require('../controllers/publicController');
const dispositivoController = require('../controllers/dispositivoController');
const ordemServicoController = require('../controllers/ordemServicoController');

// Landing Page
router.get('/', publicController.home);

// Páginas institucionais
router.get('/funcionalidades', publicController.funcionalidades);
router.get('/sobre', publicController.sobre);
router.get('/planos', publicController.planos);
router.get('/contato', publicController.contato);

// Captura de leads
router.post('/lead', publicController.salvarLead);
router.get('/obrigado', publicController.obrigado);

// 🎯 RASTREIO DE DISPOSITIVO (QR Code do dispositivo)
router.get('/rastreio/:qrcode', dispositivoController.rastreio);

// 🎯 GARANTIA DA PEÇA (QR Code da garantia)
router.get('/garantia/:qrcode', ordemServicoController.consultarGarantia);

module.exports = router;
