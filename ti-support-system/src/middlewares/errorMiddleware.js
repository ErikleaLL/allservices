function errorHandler(err, req, res, next) {
    console.error('❌ Erro:', err);

    const statusCode = err.status || 500;
    const message = err.message || 'Erro interno do servidor';

    // Se for API (JSON)
    if (req.originalUrl.startsWith('/api')) {
        return res.status(statusCode).json({
            success: false,
            error: message
        });
    }

    // Se for página web
    res.status(statusCode).render('pages/errors/500', {
        error: message
    });
}

module.exports = {
    errorHandler
};
