const Financeiro = require('../models/Financeiro');
const Cliente = require('../models/Cliente');
const Fornecedor = require('../models/Fornecedor');

// Categorias sugeridas
const CATEGORIAS = {
    receita: [
        'Venda de Peças',
        'Serviço Técnico',
        'Manutenção',
        'Consultoria',
        'Outras Receitas'
    ],
    despesa: [
        'Compra de Peças',
        'Aluguel',
        'Energia',
        'Internet',
        'Salários',
        'Marketing',
        'Impostos',
        'Outras Despesas'
    ]
};

const FORMAS_PAGAMENTO = [
    'Dinheiro',
    'PIX',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Boleto',
    'Transferência',
    'Outro'
];

// Listar
exports.index = (req, res, next) => {
    try {
        const lancamentos = Financeiro.findAll();
        const resumo = Financeiro.resumo();
        const resumoMes = Financeiro.resumoMes();

        res.render('pages/financeiro/index', {
            title: 'Financeiro',
            layout: 'layouts/main',
            lancamentos,
            resumo,
            resumoMes
        });
    } catch (error) { next(error); }
};

// Fluxo de caixa
exports.fluxo = (req, res, next) => {
    try {
        const resumo = Financeiro.resumo();
        const resumoMes = Financeiro.resumoMes();
        const proximos = Financeiro.proximosVencimentos();
        const topCategorias = Financeiro.topCategorias();

        res.render('pages/financeiro/fluxo', {
            title: 'Fluxo de Caixa',
            layout: 'layouts/main',
            resumo,
            resumoMes,
            proximos,
            topCategorias
        });
    } catch (error) { next(error); }
};

// Vencidos
exports.vencidos = (req, res, next) => {
    try {
        const vencidos = Financeiro.vencidos();

        res.render('pages/financeiro/vencidos', {
            title: 'Lançamentos Vencidos',
            layout: 'layouts/main',
            vencidos
        });
    } catch (error) { next(error); }
};

// Form novo
exports.create = (req, res, next) => {
    try {
        const clientes = Cliente.findAll();
        const fornecedores = Fornecedor.findAll();
        const tipoPreSelecionado = req.query.tipo || 'receita';

        res.render('pages/financeiro/create', {
            title: 'Novo Lançamento',
            layout: 'layouts/main',
            clientes,
            fornecedores,
            tipoPreSelecionado,
            CATEGORIAS,
            FORMAS_PAGAMENTO,
            error: null
        });
    } catch (error) { next(error); }
};

// Salvar novo
exports.store = (req, res, next) => {
    try {
        const {
            tipo, descricao, valor, categoria,
            data_vencimento, data_pagamento, status,
            forma_pagamento, observacoes,
            cliente_id, fornecedor_id
        } = req.body;

        if (!tipo || !descricao || !valor) {
            const clientes = Cliente.findAll();
            const fornecedores = Fornecedor.findAll();
            return res.render('pages/financeiro/create', {
                title: 'Novo Lançamento',
                layout: 'layouts/main',
                clientes,
                fornecedores,
                tipoPreSelecionado: tipo || 'receita',
                CATEGORIAS,
                FORMAS_PAGAMENTO,
                error: 'Tipo, descrição e valor são obrigatórios.'
            });
        }

        const novo = Financeiro.create({
            tipo,
            descricao,
            valor: parseFloat(valor),
            categoria,
            data_vencimento,
            data_pagamento: status === 'pago' ? (data_pagamento || new Date().toISOString().split('T')[0]) : null,
            status: status || 'pendente',
            forma_pagamento,
            observacoes,
            cliente_id: cliente_id || null,
            fornecedor_id: fornecedor_id || null
        });

        res.redirect('/financeiro/' + novo.id);
    } catch (error) { next(error); }
};

// Ver detalhes
exports.show = (req, res, next) => {
    try {
        const lancamento = Financeiro.findById(req.params.id);
        if (!lancamento) return res.redirect('/financeiro');

        res.render('pages/financeiro/show', {
            title: lancamento.descricao,
            layout: 'layouts/main',
            lancamento
        });
    } catch (error) { next(error); }
};

// Form edição
exports.edit = (req, res, next) => {
    try {
        const lancamento = Financeiro.findById(req.params.id);
        if (!lancamento) return res.redirect('/financeiro');

        const clientes = Cliente.findAll();
        const fornecedores = Fornecedor.findAll();

        res.render('pages/financeiro/edit', {
            title: 'Editar lançamento',
            layout: 'layouts/main',
            lancamento,
            clientes,
            fornecedores,
            CATEGORIAS,
            FORMAS_PAGAMENTO,
            error: null
        });
    } catch (error) { next(error); }
};

// Atualizar
exports.update = (req, res, next) => {
    try {
        const dados = req.body;
        dados.valor = parseFloat(dados.valor) || 0;
        
        // Se mudou para pago e não tem data, usa hoje
        if (dados.status === 'pago' && !dados.data_pagamento) {
            dados.data_pagamento = new Date().toISOString().split('T')[0];
        }

        Financeiro.update(req.params.id, dados);
        res.redirect('/financeiro/' + req.params.id);
    } catch (error) { next(error); }
};

// Marcar como pago (rápido)
exports.marcarPago = (req, res, next) => {
    try {
        Financeiro.marcarComoPago(req.params.id);
        res.redirect('/financeiro/' + req.params.id);
    } catch (error) { next(error); }
};

// Deletar
exports.destroy = (req, res, next) => {
    try {
        Financeiro.delete(req.params.id);
        res.redirect('/financeiro');
    } catch (error) { next(error); }
};
