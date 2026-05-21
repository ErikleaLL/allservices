const express = require('express');
const router = express.Router();

const ordemController = require('../controllers/ordemServicoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tecnico']));

router.get('/', ordemController.index);
router.get('/kanban', ordemController.kanban);
router.get('/create', ordemController.create);
router.post('/', ordemController.store);
router.get('/:id', ordemController.show);
router.get('/:id/imprimir', ordemController.imprimir);
router.get('/:id/adesivo-garantia', ordemController.adesivoGarantia);
router.get('/:id/edit', ordemController.edit);
router.post('/:id', ordemController.update);
router.post('/:id/status', ordemController.updateStatus);

// 🎯 NOVAS ROTAS para peças
router.post('/:id/pecas', ordemController.adicionarPeca);
router.post('/:id/pecas/estoque', ordemController.adicionarPecaEstoque);
router.post('/:id/pecas/:pecaId/delete', ordemController.removerPeca);

router.post('/:id/delete', ordemController.destroy);

module.exports = router;
