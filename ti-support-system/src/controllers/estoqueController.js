const Peca = require('../models/Peca');
const Categoria = require('../models/Categoria');
const Fornecedor = require('../models/Fornecedor');

// ============================================
// ===== PEÇAS =====
// ============================================

// Listar peças
exports.index = (req, res, next) => {
    try {
        const pecas = Peca.findAll();
        const stats = Peca.estatisticas();
        const categorias = Categoria.findAll();

        res.render('pages/estoque/index', {
            title: 'Estoque',
            layout: 'layouts/main',
            pecas,
            stats,
            categorias
        });
    } catch (error) { next(error); }
};

// Página de alertas (estoque baixo)
exports.alertas = (req, res, next) => {
    try {
        const baixoEstoque = Peca.comEstoqueBaixo();
        const semEstoque = Peca.semEstoque();
        const stats = Peca.estatisticas();

        res.render('pages/estoque/alertas', {
            title: 'Alertas de Estoque',
            layout: 'layouts/main',
            baixoEstoque,
            semEstoque,
            stats
        });
    } catch (error) { next(error); }
};

// Formulário de nova peça
exports.create = (req, res, next) => {
    try {
        const categorias = Categoria.findAll();
        const fornecedores = Fornecedor.findAll();

        res.render('pages/estoque/create', {
            title: 'Nova Peça',
            layout: 'layouts/main',
            categorias,
            fornecedores,
            error: null
        });
    } catch (error) { next(error); }
};

// Salvar nova peça
exports.store = (req, res, next) => {
    try {
        const { nome, categoria_id, fornecedor_id, preco_custo, preco_venda, quantidade, estoque_minimo } = req.body;

        if (!nome) {
            const categorias = Categoria.findAll();
            const fornecedores = Fornecedor.findAll();
            return res.render('pages/estoque/create', {
                title: 'Nova Peça',
                layout: 'layouts/main',
                categorias,
                fornecedores,
                error: 'O nome da peça é obrigatório.'
            });
        }

        const nova = Peca.create({
            nome,
            categoria_id: categoria_id || null,
            fornecedor_id: fornecedor_id || null,
            preco_custo: parseFloat(preco_custo) || 0,
            preco_venda: parseFloat(preco_venda) || 0,
            quantidade: parseInt(quantidade) || 0,
            estoque_minimo: parseInt(estoque_minimo) || 5
        });

        res.redirect('/estoque/' + nova.id);
    } catch (error) { next(error); }
};

// Detalhes da peça
exports.show = (req, res, next) => {
    try {
        const peca = Peca.findById(req.params.id);
        if (!peca) return res.redirect('/estoque');

        const movimentacoes = Peca.getMovimentacoes(req.params.id);

        res.render('pages/estoque/show', {
            title: peca.nome,
            layout: 'layouts/main',
            peca,
            movimentacoes
        });
    } catch (error) { next(error); }
};

// Formulário de edição
exports.edit = (req, res, next) => {
    try {
        const peca = Peca.findById(req.params.id);
        if (!peca) return res.redirect('/estoque');

        const categorias = Categoria.findAll();
        const fornecedores = Fornecedor.findAll();

        res.render('pages/estoque/edit', {
            title: 'Editar ' + peca.nome,
            layout: 'layouts/main',
            peca,
            categorias,
            fornecedores,
            error: null
        });
    } catch (error) { next(error); }
};

// Atualizar peça
exports.update = (req, res, next) => {
    try {
        const { nome, categoria_id, fornecedor_id, preco_custo, preco_venda, quantidade, estoque_minimo } = req.body;

        Peca.update(req.params.id, {
            nome,
            categoria_id: categoria_id || null,
            fornecedor_id: fornecedor_id || null,
            preco_custo: parseFloat(preco_custo) || 0,
            preco_venda: parseFloat(preco_venda) || 0,
            quantidade: parseInt(quantidade) || 0,
            estoque_minimo: parseInt(estoque_minimo) || 5
        });

        res.redirect('/estoque/' + req.params.id);
    } catch (error) { next(error); }
};

// Movimentar estoque (entrada ou saída)
exports.movimentar = (req, res, next) => {
    try {
        const { tipo, quantidade, motivo } = req.body;
        const usuarioId = req.session.user ? req.session.user.id : null;

        Peca.movimentar(req.params.id, {
            tipo,
            quantidade: parseInt(quantidade),
            motivo,
            usuario_id: usuarioId
        });

        res.redirect('/estoque/' + req.params.id);
    } catch (error) { next(error); }
};

// Deletar peça
exports.destroy = (req, res, next) => {
    try {
        Peca.delete(req.params.id);
        res.redirect('/estoque');
    } catch (error) { next(error); }
};

// ============================================
// ===== CATEGORIAS =====
// ============================================

exports.categoriasIndex = (req, res, next) => {
    try {
        const categorias = Categoria.findAll();
        res.render('pages/estoque/categorias', {
            title: 'Categorias',
            layout: 'layouts/main',
            categorias
        });
    } catch (error) { next(error); }
};

exports.categoriaStore = (req, res, next) => {
    try {
        const { nome, descricao } = req.body;
        if (nome) Categoria.create({ nome, descricao });
        res.redirect('/estoque/categorias/lista');
    } catch (error) { next(error); }
};

exports.categoriaUpdate = (req, res, next) => {
    try {
        const { nome, descricao } = req.body;
        Categoria.update(req.params.id, { nome, descricao });
        res.redirect('/estoque/categorias/lista');
    } catch (error) { next(error); }
};

exports.categoriaDelete = (req, res, next) => {
    try {
        Categoria.delete(req.params.id);
        res.redirect('/estoque/categorias/lista');
    } catch (error) { next(error); }
};

// ============================================
// ===== FORNECEDORES =====
// ============================================

exports.fornecedoresIndex = (req, res, next) => {
    try {
        const fornecedores = Fornecedor.findAll();
        res.render('pages/estoque/fornecedores', {
            title: 'Fornecedores',
            layout: 'layouts/main',
            fornecedores
        });
    } catch (error) { next(error); }
};

exports.fornecedorStore = (req, res, next) => {
    try {
        const { nome, email, telefone, cnpj, endereco } = req.body;
        if (nome) Fornecedor.create({ nome, email, telefone, cnpj, endereco });
        res.redirect('/estoque/fornecedores/lista');
    } catch (error) { next(error); }
};

exports.fornecedorUpdate = (req, res, next) => {
    try {
        const { nome, email, telefone, cnpj, endereco } = req.body;
        Fornecedor.update(req.params.id, { nome, email, telefone, cnpj, endereco });
        res.redirect('/estoque/fornecedores/lista');
    } catch (error) { next(error); }
};

exports.fornecedorDelete = (req, res, next) => {
    try {
        Fornecedor.delete(req.params.id);
        res.redirect('/estoque/fornecedores/lista');
    } catch (error) { next(error); }
};
