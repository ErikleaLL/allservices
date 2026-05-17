const Usuario = require('../models/Usuario');

// Exibir tela de login
exports.showLogin = (req, res) => {
    res.render('pages/auth/login', {
        layout: 'layouts/auth',
        title: 'Login',
        error: null
    });
};

// Processar login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.render('pages/auth/login', {
                layout: 'layouts/auth',
                title: 'Login',
                error: 'Preencha todos os campos.'
            });
        }

        // Busca usuário no banco
        const usuario = Usuario.findByEmail(email);

        if (!usuario) {
            return res.render('pages/auth/login', {
                layout: 'layouts/auth',
                title: 'Login',
                error: 'E-mail ou senha inválidos.'
            });
        }

        // Verifica se está ativo
        if (!usuario.ativo) {
            return res.render('pages/auth/login', {
                layout: 'layouts/auth',
                title: 'Login',
                error: 'Usuário desativado. Contate o administrador.'
            });
        }

        // Verifica senha
        const senhaValida = Usuario.checkPassword(password, usuario.senha);

        if (!senhaValida) {
            return res.render('pages/auth/login', {
                layout: 'layouts/auth',
                title: 'Login',
                error: 'E-mail ou senha inválidos.'
            });
        }

        // Cria sessão
        req.session.user = {
            id: usuario.id,
            name: usuario.nome,
            email: usuario.email,
            role: usuario.role
        };

        res.redirect('/dashboard');

    } catch (error) {
        next(error);
    }
};

// Exibir tela de registro
exports.showRegister = (req, res) => {
    res.render('pages/auth/register', {
        layout: 'layouts/auth',
        title: 'Cadastro',
        error: null
    });
};

// Processar registro
exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.render('pages/auth/register', {
                layout: 'layouts/auth',
                title: 'Cadastro',
                error: 'Preencha todos os campos.'
            });
        }

        // Verifica se já existe
        const existente = Usuario.findByEmail(email);

        if (existente) {
            return res.render('pages/auth/register', {
                layout: 'layouts/auth',
                title: 'Cadastro',
                error: 'Este e-mail já está cadastrado.'
            });
        }

        // Cria usuário (padrão: cliente)
        Usuario.create({
            nome: name,
            email: email,
            senha: password,
            role: 'cliente'
        });

        res.redirect('/auth/login');

    } catch (error) {
        next(error);
    }
};

// Logout
exports.logout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login');
    });
};
