const Lead = require('../models/Lead');

// Listar todos os leads
exports.index = (req, res, next) => {
    try {
        const leads = Lead.findAll();
        const stats = Lead.countByStatus();
        const total = Lead.count();

        // Organizar estatísticas
        const estatisticas = {
            total: total,
            novo: 0,
            contatado: 0,
            em_negociacao: 0,
            convertido: 0,
            perdido: 0
        };

        stats.forEach(s => {
            estatisticas[s.status] = s.total;
        });

        res.render('pages/leads/index', {
            title: 'Painel de Leads',
            layout: 'layouts/main',
            leads,
            estatisticas
        });
    } catch (error) {
        next(error);
    }
};

// Detalhes do lead
exports.show = (req, res, next) => {
    try {
        const lead = Lead.findById(req.params.id);

        if (!lead) {
            return res.redirect('/leads');
        }

        res.render('pages/leads/show', {
            title: 'Detalhes do Lead',
            layout: 'layouts/main',
            lead
        });
    } catch (error) {
        next(error);
    }
};

// Atualizar status
exports.updateStatus = (req, res, next) => {
    try {
        const { status } = req.body;

        Lead.updateStatus(req.params.id, status);

        res.redirect('/leads/' + req.params.id);
    } catch (error) {
        next(error);
    }
};

// Deletar lead
exports.destroy = (req, res, next) => {
    try {
        Lead.delete(req.params.id);
        res.redirect('/leads');
    } catch (error) {
        next(error);
    }
};
