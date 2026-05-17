const Usuario = require('../models/Usuario');

// Listar todos os usuários
exports.index = (req, res, next) => {
    try {
        const usuarios = Usuario.findAll();

        res.render('pages/usuarios/index', {
            title: 'Usuários',
            layout: 'layouts/main',
            usuarios
        });
    } catch (error) {
        next(error);
    }
};

// Formulário de criação
exports.create = (req, res) => {
    res.render('pages/usuarios/create', {
        title: 'Novo Usuário',
        layout: 'layouts/main',
        error: null
    });
};

// Salvar novo usuário
exports.store = (req, res, next) => {
    try {
        const { nome, email, senha, role } = req.body;

        if (!nome || !email || !senha || !role) {
            return res.render('pages/usuarios/create', {
                title: 'Novo Usuário',
                layout: 'layouts/main',
                error: 'Preencha todos os campos.'
            });
        }

        const existente = Usuario.findByEmail(email);

        if (existente) {
            return res.render('pages/usuarios/create', {
                title: 'Novo Usuário',
                layout: 'layouts/main',
                error: 'Este e-mail já está cadastrado.'
            });
        }

        Usuario.create({ nome, email, senha, role });

        res.redirect('/usuarios');
    } catch (error) {
        next(error);
    }
};

// Visualizar usuário
exports.show = (req, res, next) => {
    try {
        const usuario = Usuario.findById(req.params.id);

        if (!usuario) {
            return res.redirect('/usuarios');
        }

        res.render('pages/usuarios/show', {
            title: 'Detalhes do Usuário',
            layout: 'layouts/main',
            usuario
        });
    } catch (error) {
        next(error);
    }
};

// Formulário de edição
exports.edit = (req, res, next) => {
    try {
        const usuario = Usuario.findById(req.params.id);

        if (!usuario) {
            return res.redirect('/usuarios');
        }

        res.render('pages/usuarios/edit', {
            title: 'Editar Usuário',
            layout: 'layouts/main',
            usuario,
            error: null
        });
    } catch (error) {
        next(error);
    }
};

// Atualizar
exports.update = (req, res, next) => {
    try {
        const { nome, email, role, ativo } = req.body;

        Usuario.update(req.params.id, {
            nome,
            email,
            role,
            ativo: ativo ? 1 : 0
        });

        res.redirect('/usuarios');
    } catch (error) {
        next(error);
    }
};

// Deletar
exports.destroy = (req, res, next) => {
    try {
        Usuario.delete(req.params.id);
        res.redirect('/usuarios');
    } catch (error) {
        next(error);
    }
};
