const express = require('express');
const router = express.Router();

const ordemController = require('../controllers/ordemServicoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Rotas protegidas
router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tecnico']));

// Listar todas
router.get('/', ordemController.index);

// Visão Kanban (drag & drop por status)
router.get('/kanban', ordemController.kanban);

// Formulário de criação
router.get('/create', ordemController.create);

// Salvar nova OS
router.post('/', ordemController.store);

// Ver detalhes da OS
router.get('/:id', ordemController.show);

// 🖨️ Imprimir OS (para entregar ao cliente)
router.get('/:id/imprimir', ordemController.imprimir);

// Editar
router.get('/:id/edit', ordemController.edit);

// Atualizar
router.post('/:id', ordemController.update);

// Mudar status
router.post('/:id/status', ordemController.updateStatus);

// Adicionar peça à OS
router.post('/:id/pecas', ordemController.adicionarPeca);

// Remover peça da OS
router.post('/:id/pecas/:pecaId/delete', ordemController.removerPeca);

// Deletar OS
router.post('/:id/delete', ordemController.destroy);

module.exports = router;
