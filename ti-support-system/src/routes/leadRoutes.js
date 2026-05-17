const express = require('express');
const router = express.Router();

const leadController = require('../controllers/leadController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Protegido: só admin pode acessar
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Listar todos
router.get('/', leadController.index);

// Ver detalhes
router.get('/:id', leadController.show);

// Atualizar status
router.post('/:id/status', leadController.updateStatus);

// Deletar
router.post('/:id/delete', leadController.destroy);

module.exports = router;
