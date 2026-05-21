const Configuracao = require('../models/Configuracao');
const Usuario = require('../models/Usuario');
const Cliente = require('../models/Cliente');
const Lead = require('../models/Lead');
const Dispositivo = require('../models/Dispositivo');
const OrdemServico = require('../models/OrdemServico');
const Peca = require('../models/Peca');
const Financeiro = require('../models/Financeiro');
const fs = require('fs');
const path = require('path');

// Dashboard admin
exports.index = (req, res, next) => {
    try {
        const config = Configuracao.getAll();
        
        const stats = {
            totalUsuarios: Usuario.count(),
            totalClientes: Cliente.count(),
            totalLeads: Lead.count(),
            totalDispositivos: Dispositivo.count(),
            totalOS: OrdemServico.count(),
            totalPecas: Peca.count(),
            estoqueValor: Peca.estatisticas().valorTotal
        };

        // Tamanho do banco
        const dbPath = path.join(__dirname, '../../database/database.sqlite');
        let dbSize = 0;
        if (fs.existsSync(dbPath)) {
            const stat = fs.statSync(dbPath);
            dbSize = (stat.size / 1024).toFixed(2);
        }

        res.render('pages/admin/index', {
            title: 'Administração',
            layout: 'layouts/main',
            config,
            stats,
            dbSize
        });
    } catch (error) { next(error); }
};

// Empresa
exports.empresa = (req, res, next) => {
    try {
        const config = Configuracao.getAll();
        res.render('pages/admin/empresa', {
            title: 'Dados da Empresa',
            layout: 'layouts/main',
            config,
            sucesso: req.query.sucesso === '1'
        });
    } catch (error) { next(error); }
};

exports.salvarEmpresa = (req, res, next) => {
    try {
        const { empresa_nome, empresa_slogan, empresa_telefone, empresa_email, empresa_endereco, empresa_cnpj, empresa_horario } = req.body;

        Configuracao.updateMany({
            empresa_nome, empresa_slogan, empresa_telefone,
            empresa_email, empresa_endereco, empresa_cnpj, empresa_horario
        });

        res.redirect('/admin/empresa?sucesso=1');
    } catch (error) { next(error); }
};

// Sistema
exports.sistema = (req, res, next) => {
    try {
        const config = Configuracao.getAll();
        res.render('pages/admin/sistema', {
            title: 'Configurações do Sistema',
            layout: 'layouts/main',
            config,
            sucesso: req.query.sucesso === '1'
        });
    } catch (error) { next(error); }
};

exports.salvarSistema = (req, res, next) => {
    try {
        const { config_garantia_padrao, config_prazo_padrao, whatsapp_atendimento } = req.body;

        Configuracao.updateMany({
            config_garantia_padrao,
            config_prazo_padrao,
            whatsapp_atendimento
        });

        res.redirect('/admin/sistema?sucesso=1');
    } catch (error) { next(error); }
};

// Templates
exports.templates = (req, res, next) => {
    try {
        const config = Configuracao.getAll();
        res.render('pages/admin/templates', {
            title: 'Templates de Mensagens',
            layout: 'layouts/main',
            config,
            sucesso: req.query.sucesso === '1'
        });
    } catch (error) { next(error); }
};

exports.salvarTemplates = (req, res, next) => {
    try {
        const { template_whatsapp_pronto, template_whatsapp_orcamento } = req.body;

        Configuracao.updateMany({
            template_whatsapp_pronto,
            template_whatsapp_orcamento
        });

        res.redirect('/admin/templates?sucesso=1');
    } catch (error) { next(error); }
};

// Backup
exports.backup = (req, res, next) => {
    try {
        const dbPath = path.join(__dirname, '../../database/database.sqlite');
        let dbSize = 0;
        let dbDate = null;
        
        if (fs.existsSync(dbPath)) {
            const stat = fs.statSync(dbPath);
            dbSize = (stat.size / 1024).toFixed(2);
            dbDate = stat.mtime;
        }

        res.render('pages/admin/backup', {
            title: 'Backup do Sistema',
            layout: 'layouts/main',
            dbSize,
            dbDate
        });
    } catch (error) { next(error); }
};

exports.downloadBackup = (req, res, next) => {
    try {
        const dbPath = path.join(__dirname, '../../database/database.sqlite');
        const data = new Date().toISOString().split('T')[0];
        const fileName = `allservices-backup-${data}.sqlite`;

        res.download(dbPath, fileName);
    } catch (error) { next(error); }
};

// Estatísticas
exports.estatisticas = (req, res, next) => {
    try {
        const stats = {
            usuarios: Usuario.count(),
            clientes: Cliente.count(),
            leads: Lead.count(),
            dispositivos: Dispositivo.count(),
            ordens: OrdemServico.count(),
            pecas: Peca.count(),
            estoqueValor: Peca.estatisticas().valorTotal,
            estoqueLucro: Peca.estatisticas().lucroEstimado,
            financeiro: Financeiro.resumo()
        };

        // OS por status
        const osStatus = OrdemServico.countByStatus();
        
        // Leads por status
        const leadsStatus = Lead.countByStatus();

        res.render('pages/admin/estatisticas', {
            title: 'Estatísticas Avançadas',
            layout: 'layouts/main',
            stats,
            osStatus,
            leadsStatus
        });
    } catch (error) { next(error); }
};
