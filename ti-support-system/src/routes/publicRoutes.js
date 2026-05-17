const express = require('express');
const router = express.Router();

const publicController = require('../controllers/publicController');

// Landing Page (página inicial)
router.get('/', publicController.home);

// Página de funcionalidades
router.get('/funcionalidades', publicController.funcionalidades);

// Página sobre
router.get('/sobre', publicController.sobre);

// Página de planos
router.get('/planos', publicController.planos);

// Página de contato
router.get('/contato', publicController.contato);

// Capturar lead (formulário)
router.post('/lead', publicController.salvarLead);

// Página de obrigado (após enviar formulário)
router.get('/obrigado', publicController.obrigado);

module.exports = router;
