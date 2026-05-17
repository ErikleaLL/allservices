const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Todas as rotas exigem login
router.use(authMiddleware);

// Apenas admin pode gerenciar usuários
router.use(roleMiddleware(['admin']));

// Listar
router.get('/', usuarioController.index);

// Formulário de criação
router.get('/create', usuarioController.create);

// Salvar novo
router.post('/', usuarioController.store);

// Visualizar
router.get('/:id', usuarioController.show);

// Formulário de edição
router.get('/:id/edit', usuarioController.edit);

// Atualizar
router.post('/:id', usuarioController.update);

// Deletar
router.post('/:id/delete', usuarioController.destroy);

module.exports = router;
