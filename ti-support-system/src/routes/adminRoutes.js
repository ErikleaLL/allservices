const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

// Só admin acessa
router.use(authMiddleware);
router.use(roleMiddleware(['admin']));

// Dashboard admin
router.get('/', adminController.index);

// Configurações da empresa
router.get('/empresa', adminController.empresa);
router.post('/empresa', adminController.salvarEmpresa);

// Configurações do sistema
router.get('/sistema', adminController.sistema);
router.post('/sistema', adminController.salvarSistema);

// Templates de mensagens
router.get('/templates', adminController.templates);
router.post('/templates', adminController.salvarTemplates);

// Backup
router.get('/backup', adminController.backup);
router.get('/backup/download', adminController.downloadBackup);

// Estatísticas avançadas
router.get('/estatisticas', adminController.estatisticas);

module.exports = router;
