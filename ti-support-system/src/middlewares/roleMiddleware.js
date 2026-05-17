module.exports = (rolesPermitidas = []) => {
    return (req, res, next) => {
        const user = req.session.user;

        if (!user) {
            return res.redirect('/auth/login');
        }

        if (!rolesPermitidas.includes(user.role)) {
            return res.status(403).send(`
                <h1>403 - Acesso Negado</h1>
                <p>Você não tem permissão para acessar esta página.</p>
                <a href="/dashboard">Voltar</a>
            `);
        }

        next();
    };
};
