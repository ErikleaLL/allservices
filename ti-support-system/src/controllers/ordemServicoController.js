const OrdemServico = require('../models/OrdemServico');
const Cliente = require('../models/Cliente');
const Dispositivo = require('../models/Dispositivo');
const Usuario = require('../models/Usuario');

// Status das OS com cor, ícone e label
const STATUS_OS = {
    'orcamento':         { label: 'Orçamento',         cor: '#fbbf24', icone: 'ti-file-dollar' },
    'aprovada':          { label: 'Aprovada',          cor: '#60a5fa', icone: 'ti-thumb-up' },
    'em_execucao':       { label: 'Em Execução',       cor: '#a78bfa', icone: 'ti-tools' },
    'aguardando_peca':   { label: 'Aguardando Peça',   cor: '#f97316', icone: 'ti-clock' },
    'pronta':            { label: 'Pronta',            cor: '#4ade80', icone: 'ti-check' },
    'entregue':          { label: 'Entregue',          cor: '#94a3b8', icone: 'ti-truck-delivery' },
    'cancelada':         { label: 'Cancelada',         cor: '#f87171', icone: 'ti-x' }
};

// Listar todas
exports.index = (req, res, next) => {
    try {
        const ordens = OrdemServico.findAll();
        const total = OrdemServico.count();
        const statusCount = OrdemServico.countByStatus();
        const receitaMes = OrdemServico.receitaDoMes();

        // Organiza estatísticas
        const stats = {
            total,
            orcamento: 0,
            aprovada: 0,
            em_execucao: 0,
            aguardando_peca: 0,
            pronta: 0,
            entregue: 0,
            cancelada: 0,
            receitaMes
        };

        statusCount.forEach(s => {
            stats[s.status] = s.total;
        });

        res.render('pages/ordens/index', {
            title: 'Ordens de Serviço',
            layout: 'layouts/main',
            ordens,
            stats,
            STATUS_OS
        });
    } catch (error) { next(error); }
};

// Visão Kanban
exports.kanban = (req, res, next) => {
    try {
        const ordens = OrdemServico.findAll();

        // Agrupar por status
        const colunas = {};
        Object.keys(STATUS_OS).forEach(key => {
            colunas[key] = [];
        });

        ordens.forEach(os => {
            if (colunas[os.status]) {
                colunas[os.status].push(os);
            }
        });

        res.render('pages/ordens/kanban', {
            title: 'Kanban - Ordens de Serviço',
            layout: 'layouts/main',
            colunas,
            STATUS_OS
        });
    } catch (error) { next(error); }
};

// Formulário de criação
exports.create = (req, res, next) => {
    try {
        const clientes = Cliente.findAll();
        const dispositivos = Dispositivo.findAll();
        const tecnicos = Usuario.findAll().filter(u => 
            u.role === 'tecnico' || u.role === 'admin'
        );

        // Pré-seleciona se vier do dispositivo
        const dispositivoPreSelecionado = req.query.dispositivo_id || null;

        res.render('pages/ordens/create', {
            title: 'Nova Ordem de Serviço',
            layout: 'layouts/main',
            clientes,
            dispositivos,
            tecnicos,
            dispositivoPreSelecionado,
            error: null,
            STATUS_OS
        });
    } catch (error) { next(error); }
};

// Salvar nova OS
exports.store = (req, res, next) => {
    try {
        const {
            dispositivo_id, cliente_id, tecnico_id,
            diagnostico, descricao_servico,
            valor_mao_obra, prazo_entrega,
            observacoes_internas, observacoes_publicas,
            garantia_dias
        } = req.body;

        if (!cliente_id || !dispositivo_id) {
            return res.redirect('/ordens/create');
        }

        const valor_mao_obra_num = parseFloat(valor_mao_obra) || 0;
        const valor_total = valor_mao_obra_num; // peças são adicionadas depois

        const nova = OrdemServico.create({
            dispositivo_id: parseInt(dispositivo_id),
            cliente_id: parseInt(cliente_id),
            tecnico_id: tecnico_id ? parseInt(tecnico_id) : null,
            diagnostico,
            descricao_servico,
            valor_mao_obra: valor_mao_obra_num,
            valor_pecas: 0,
            valor_total,
            prazo_entrega,
            observacoes_internas,
            observacoes_publicas,
            garantia_dias: parseInt(garantia_dias) || 90
        });

        res.redirect('/ordens/' + nova.id);
    } catch (error) { next(error); }
};

// Ver detalhes
exports.show = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');

        res.render('pages/ordens/show', {
            title: 'OS ' + ordem.numero_os,
            layout: 'layouts/main',
            ordem,
            STATUS_OS
        });
    } catch (error) { next(error); }
};

// Imprimir OS
exports.imprimir = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');

        res.render('pages/ordens/imprimir', {
            title: 'Imprimir OS - ' + ordem.numero_os,
            layout: false,
            ordem,
            STATUS_OS
        });
    } catch (error) { next(error); }
};

// Editar
exports.edit = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');

        const clientes = Cliente.findAll();
        const dispositivos = Dispositivo.findAll();
        const tecnicos = Usuario.findAll().filter(u => 
            u.role === 'tecnico' || u.role === 'admin'
        );

        res.render('pages/ordens/edit', {
            title: 'Editar OS ' + ordem.numero_os,
            layout: 'layouts/main',
            ordem,
            clientes,
            dispositivos,
            tecnicos,
            STATUS_OS,
            error: null
        });
    } catch (error) { next(error); }
};

// Atualizar
exports.update = (req, res, next) => {
    try {
        const dados = req.body;
        
        // Converte números
        dados.valor_mao_obra = parseFloat(dados.valor_mao_obra) || 0;
        dados.valor_pecas = parseFloat(dados.valor_pecas) || 0;
        dados.valor_total = dados.valor_mao_obra + dados.valor_pecas;
        dados.garantia_dias = parseInt(dados.garantia_dias) || 90;

        OrdemServico.update(req.params.id, dados);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

// Mudar status rápido
exports.updateStatus = (req, res, next) => {
    try {
        const { status, observacao } = req.body;
        const usuarioId = req.session.user ? req.session.user.id : null;

        OrdemServico.updateStatus(req.params.id, status, observacao, usuarioId);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

// Adicionar peça
exports.adicionarPeca = (req, res, next) => {
    try {
        const { descricao, quantidade, valor_unitario } = req.body;
        
        OrdemServico.adicionarPeca(req.params.id, {
            descricao,
            quantidade: parseInt(quantidade) || 1,
            valor_unitario: parseFloat(valor_unitario) || 0
        });

        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

// Remover peça
exports.removerPeca = (req, res, next) => {
    try {
        OrdemServico.removerPeca(req.params.pecaId);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

// Deletar OS
exports.destroy = (req, res, next) => {
    try {
        OrdemServico.delete(req.params.id);
        res.redirect('/ordens');
    } catch (error) { next(error); }
};
