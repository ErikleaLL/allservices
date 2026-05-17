const express = require('express');
const router = express.Router();

const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protegido: precisa estar logado
router.use(authMiddleware);

// Apenas admin e técnico podem gerenciar clientes
router.use(roleMiddleware(['admin', 'tecnico']));

// Listar todos
router.get('/', clienteController.index);

// Formulário de criação
router.get('/create', clienteController.create);

// Salvar novo
router.post('/', clienteController.store);

// Visualizar
router.get('/:id', clienteController.show);

// Formulário de edição
router.get('/:id/edit', clienteController.edit);

// Atualizar
router.post('/:id', clienteController.update);

// Deletar
router.post('/:id/delete', clienteController.destroy);

module.exports = router;
