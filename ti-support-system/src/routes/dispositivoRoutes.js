const express = require('express');
const router = express.Router();

const dispositivoController = require('../controllers/dispositivoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tecnico']));

// Listar todos
router.get('/', dispositivoController.index);

// Formulário novo
router.get('/create', dispositivoController.create);

// Salvar
router.post('/', dispositivoController.store);

// Ver detalhes
router.get('/:id', dispositivoController.show);

// 🖨️ Imprimir etiqueta (para o dispositivo)
router.get('/:id/etiqueta', dispositivoController.etiqueta);

// 🎫 Imprimir comprovante (para o cliente)
router.get('/:id/comprovante', dispositivoController.comprovante);

// Editar
router.get('/:id/edit', dispositivoController.edit);

// Atualizar
router.post('/:id', dispositivoController.update);

// Mudar status
router.post('/:id/status', dispositivoController.updateStatus);

// Deletar
router.post('/:id/delete', dispositivoController.destroy);

module.exports = router;
