const express = require('express');
const router = express.Router();

const estoqueController = require('../controllers/estoqueController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'tecnico']));

// ===== CATEGORIAS (PRIMEIRO antes de /:id) =====
router.get('/categorias/lista', estoqueController.categoriasIndex);
router.post('/categorias', estoqueController.categoriaStore);
router.post('/categorias/:id', estoqueController.categoriaUpdate);
router.post('/categorias/:id/delete', estoqueController.categoriaDelete);

// ===== FORNECEDORES (PRIMEIRO antes de /:id) =====
router.get('/fornecedores/lista', estoqueController.fornecedoresIndex);
router.post('/fornecedores', estoqueController.fornecedorStore);
router.post('/fornecedores/:id', estoqueController.fornecedorUpdate);
router.post('/fornecedores/:id/delete', estoqueController.fornecedorDelete);

// ===== ALERTAS =====
router.get('/alertas', estoqueController.alertas);

// ===== PEÇAS =====
router.get('/', estoqueController.index);
router.get('/create', estoqueController.create);
router.post('/', estoqueController.store);
router.get('/:id', estoqueController.show);
router.get('/:id/edit', estoqueController.edit);
router.post('/:id', estoqueController.update);
router.post('/:id/movimentar', estoqueController.movimentar);
router.post('/:id/delete', estoqueController.destroy);

module.exports = router;
