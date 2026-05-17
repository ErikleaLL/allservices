const Lead = require('../models/Lead');

// Landing Page Principal
exports.home = (req, res) => {
    res.render('pages/public/home', {
        layout: 'layouts/public',
        title: 'Allservices - Manutenção inteligente, gestão simples'
    });
};

// Página de Funcionalidades
exports.funcionalidades = (req, res) => {
    res.render('pages/public/funcionalidades', {
        layout: 'layouts/public',
        title: 'Funcionalidades - Allservices'
    });
};

// Página Sobre
exports.sobre = (req, res) => {
    res.render('pages/public/sobre', {
        layout: 'layouts/public',
        title: 'Sobre - Allservices'
    });
};

// Página de Planos
exports.planos = (req, res) => {
    res.render('pages/public/planos', {
        layout: 'layouts/public',
        title: 'Planos - Allservices'
    });
};

// Página de Contato
exports.contato = (req, res) => {
    res.render('pages/public/contato', {
        layout: 'layouts/public',
        title: 'Contato - Allservices',
        success: false
    });
};

// Salvar Lead capturado pelo formulário
exports.salvarLead = (req, res, next) => {
    try {
        const { nome, email, whatsapp, empresa, interesse, mensagem } = req.body;

        if (!nome || !email) {
            return res.redirect('/contato');
        }

        Lead.create({
            nome,
            email,
            whatsapp,
            empresa,
            interesse,
            mensagem,
            origem: 'site'
        });

        res.redirect('/obrigado');

    } catch (error) {
        next(error);
    }
};

// Página de obrigado
exports.obrigado = (req, res) => {
    res.render('pages/public/obrigado', {
        layout: 'layouts/public',
        title: 'Obrigado! - Allservices'
    });
};
