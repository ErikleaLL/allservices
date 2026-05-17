const Cliente = require('../models/Cliente');

exports.index = (req, res, next) => {
    try {
        const clientes = Cliente.findAll();
        const total = Cliente.count();
        res.render('pages/clientes/index', {
            title: 'Clientes',
            layout: 'layouts/main',
            clientes,
            total
        });
    } catch (error) { next(error); }
};

exports.create = (req, res) => {
    res.render('pages/clientes/create', {
        title: 'Novo Cliente',
        layout: 'layouts/main',
        error: null
    });
};

exports.store = (req, res, next) => {
    try {
        const { nome, email, telefone, cpf_cnpj, endereco } = req.body;
        if (!nome) {
            return res.render('pages/clientes/create', {
                title: 'Novo Cliente',
                layout: 'layouts/main',
                error: 'O nome é obrigatório.'
            });
        }
        Cliente.create({ nome, email, telefone, cpf_cnpj, endereco });
        res.redirect('/clientes');
    } catch (error) { next(error); }
};

exports.show = (req, res, next) => {
    try {
        const cliente = Cliente.findById(req.params.id);
        if (!cliente) return res.redirect('/clientes');
        res.render('pages/clientes/show', {
            title: 'Detalhes do Cliente',
            layout: 'layouts/main',
            cliente
        });
    } catch (error) { next(error); }
};

exports.edit = (req, res, next) => {
    try {
        const cliente = Cliente.findById(req.params.id);
        if (!cliente) return res.redirect('/clientes');
        res.render('pages/clientes/edit', {
            title: 'Editar Cliente',
            layout: 'layouts/main',
            cliente,
            error: null
        });
    } catch (error) { next(error); }
};

exports.update = (req, res, next) => {
    try {
        const { nome, email, telefone, cpf_cnpj, endereco } = req.body;
        Cliente.update(req.params.id, { nome, email, telefone, cpf_cnpj, endereco });
        res.redirect('/clientes');
    } catch (error) { next(error); }
};

exports.destroy = (req, res, next) => {
    try {
        Cliente.delete(req.params.id);
        res.redirect('/clientes');
    } catch (error) { next(error); }
};
