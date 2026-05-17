module.exports = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }

    // Disponibiliza usuário para todas as views
    res.locals.user = req.session.user;

    next();
};
