// Dashboard principal
exports.index = (req, res) => {
    const user = req.session.user;

    // Redireciona conforme o perfil
    if (user.role === 'admin') {
        return res.redirect('/dashboard/admin');
    }

    if (user.role === 'tecnico') {
        return res.redirect('/dashboard/tecnico');
    }

    if (user.role === 'cliente') {
        return res.redirect('/dashboard/cliente');
    }

    // Caso padrão
    res.render('pages/dashboard/index', {
        title: 'Dashboard',
        layout: 'layouts/main'
    });
};

// Dashboard Admin
exports.admin = (req, res) => {
    res.render('pages/dashboard/admin', {
        title: 'Dashboard Administrativo',
        layout: 'layouts/main'
    });
};

// Dashboard Técnico
exports.tecnico = (req, res) => {
    res.render('pages/dashboard/tecnico', {
        title: 'Dashboard Técnico',
        layout: 'layouts/main'
    });
};

// Dashboard Cliente
exports.cliente = (req, res) => {
    res.render('pages/dashboard/cliente', {
        title: 'Dashboard Cliente',
        layout: 'layouts/main'
    });
};
