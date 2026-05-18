const express = require('express');
const router = express.Router();

const dispositivoController = require('../controllers/dispositivoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// ⚠️ Rotas protegidas (admin e técnico)
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tecnico']));

// Listar todos
router.get('/', dispositivoController.index);

// Formulário de criação
router.get('/create', dispositivoController.create);

// Salvar novo
router.post('/', dispositivoController.store);

// Visualizar
router.get('/:id', dispositivoController.show);

// Imprimir etiqueta (QR Code)
router.get('/:id/etiqueta', dispositivoController.etiqueta);

// Formulário de edição
router.get('/:id/edit', dispositivoController.edit);

// Atualizar
router.post('/:id', dispositivoController.update);

// Mudar status rápido
router.post('/:id/status', dispositivoController.updateStatus);

// Deletar
router.post('/:id/delete', dispositivoController.destroy);

module.exports = router;
