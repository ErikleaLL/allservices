const express = require('express');
const router = express.Router();

const financeiroController = require('../controllers/financeiroController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Listar (com filtros)
router.get('/', financeiroController.index);

// Fluxo de caixa
router.get('/fluxo', financeiroController.fluxo);

// Vencidos
router.get('/vencidos', financeiroController.vencidos);

// Formulário novo
router.get('/create', financeiroController.create);

// Salvar novo
router.post('/', financeiroController.store);

// Ver detalhes
router.get('/:id', financeiroController.show);

// Editar
router.get('/:id/edit', financeiroController.edit);

// Atualizar
router.post('/:id', financeiroController.update);

// Marcar como pago (rápido)
router.post('/:id/pagar', financeiroController.marcarPago);

// Deletar
router.post('/:id/delete', financeiroController.destroy);

module.exports = router;
