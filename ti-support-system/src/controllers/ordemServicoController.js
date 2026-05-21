const OrdemServico = require('../models/OrdemServico');
const Cliente = require('../models/Cliente');
const Dispositivo = require('../models/Dispositivo');
const Usuario = require('../models/Usuario');
const Peca = require('../models/Peca');
const QRCode = require('qrcode');

const STATUS_OS = {
    'orcamento':         { label: 'Orçamento',         cor: '#fbbf24', icone: 'ti-file-dollar' },
    'aprovada':          { label: 'Aprovada',          cor: '#60a5fa', icone: 'ti-thumb-up' },
    'em_execucao':       { label: 'Em Execução',       cor: '#a78bfa', icone: 'ti-tools' },
    'aguardando_peca':   { label: 'Aguardando Peça',   cor: '#f97316', icone: 'ti-clock' },
    'pronta':            { label: 'Pronta',            cor: '#4ade80', icone: 'ti-check' },
    'entregue':          { label: 'Entregue',          cor: '#94a3b8', icone: 'ti-truck-delivery' },
    'cancelada':         { label: 'Cancelada',         cor: '#f87171', icone: 'ti-x' }
};

function getBaseUrl(req) {
    if (process.env.PUBLIC_URL) return process.env.PUBLIC_URL;
    const forwardedHost = req.get('x-forwarded-host');
    const forwardedProto = req.get('x-forwarded-proto') || 'https';
    if (forwardedHost) return `${forwardedProto}://${forwardedHost}`;
    if (process.env.CODESPACE_NAME) return `https://${process.env.CODESPACE_NAME}-3000.app.github.dev`;
    return `${req.protocol}://${req.get('host')}`;
}

exports.index = (req, res, next) => {
    try {
        const ordens = OrdemServico.findAll();
        const total = OrdemServico.count();
        const statusCount = OrdemServico.countByStatus();
        const receitaMes = OrdemServico.receitaDoMes();

        const stats = { total, orcamento: 0, aprovada: 0, em_execucao: 0, aguardando_peca: 0, pronta: 0, entregue: 0, cancelada: 0, receitaMes };
        statusCount.forEach(s => { stats[s.status] = s.total; });

        res.render('pages/ordens/index', { 
            title: 'Ordens de Serviço', 
            layout: 'layouts/main', 
            ordens, stats, STATUS_OS 
        });
    } catch (error) { next(error); }
};

exports.kanban = (req, res, next) => {
    try {
        const ordens = OrdemServico.findAll();
        const colunas = {};
        Object.keys(STATUS_OS).forEach(key => { colunas[key] = []; });
        ordens.forEach(os => { if (colunas[os.status]) colunas[os.status].push(os); });
        res.render('pages/ordens/kanban', { 
            title: 'Kanban - Ordens de Serviço', 
            layout: 'layouts/main', 
            colunas, STATUS_OS 
        });
    } catch (error) { next(error); }
};

exports.create = (req, res, next) => {
    try {
        const clientes = Cliente.findAll();
        const dispositivos = Dispositivo.findAll();
        const tecnicos = Usuario.findAll().filter(u => u.role === 'tecnico' || u.role === 'admin');
        const dispositivoPreSelecionado = req.query.dispositivo_id || null;

        res.render('pages/ordens/create', {
            title: 'Nova Ordem de Serviço', 
            layout: 'layouts/main',
            clientes, dispositivos, tecnicos, dispositivoPreSelecionado, 
            error: null, STATUS_OS
        });
    } catch (error) { next(error); }
};

exports.store = (req, res, next) => {
    try {
        const { dispositivo_id, cliente_id, tecnico_id, diagnostico, descricao_servico, valor_mao_obra, prazo_entrega, observacoes_internas, observacoes_publicas, garantia_dias } = req.body;
        if (!cliente_id || !dispositivo_id) return res.redirect('/ordens/create');

        const valor_mao_obra_num = parseFloat(valor_mao_obra) || 0;

        const nova = OrdemServico.create({
            dispositivo_id: parseInt(dispositivo_id),
            cliente_id: parseInt(cliente_id),
            tecnico_id: tecnico_id ? parseInt(tecnico_id) : null,
            diagnostico, descricao_servico,
            valor_mao_obra: valor_mao_obra_num,
            valor_pecas: 0, valor_total: valor_mao_obra_num,
            prazo_entrega, observacoes_internas, observacoes_publicas,
            garantia_dias: parseInt(garantia_dias) || 90
        });

        res.redirect('/ordens/' + nova.id);
    } catch (error) { next(error); }
};

exports.show = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');
        
        const pecasEstoque = Peca.findAll().filter(p => p.quantidade > 0);

        res.render('pages/ordens/show', {
            title: 'OS ' + ordem.numero_os, 
            layout: 'layouts/main',
            ordem, 
            STATUS_OS, 
            pecasEstoque,
            query: req.query || {}
        });
    } catch (error) { next(error); }
};

exports.imprimir = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');
        res.render('pages/ordens/imprimir', { 
            title: 'Imprimir OS - ' + ordem.numero_os, 
            layout: false, 
            ordem, STATUS_OS 
        });
    } catch (error) { next(error); }
};

exports.adesivoGarantia = async (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');

        const baseUrl = getBaseUrl(req);
        const urlGarantia = baseUrl + '/garantia/' + ordem.qr_code_garantia;

        const qrImage = await QRCode.toDataURL(urlGarantia, { 
            width: 400, margin: 1, 
            color: { dark: '#000', light: '#fff' } 
        });

        res.render('pages/ordens/adesivo-garantia', {
            title: 'Adesivo de Garantia - ' + ordem.numero_os,
            layout: false, 
            ordem, qrImage, urlGarantia
        });
    } catch (error) { next(error); }
};

exports.consultarGarantia = (req, res, next) => {
    try {
        const ordem = OrdemServico.findByQrGarantia(req.params.qrcode);
        if (!ordem) {
            return res.status(404).render('pages/public/garantia-naoencontrada', {
                title: 'Garantia não encontrada', 
                layout: 'layouts/public'
            });
        }

        let garantiaAtiva = false, diasRestantes = 0, dataExpiracao = null;
        let dataReferencia = ordem.concluido_em || ordem.criado_em;

        if (ordem.garantia_dias && dataReferencia) {
            const dataServ = new Date(dataReferencia);
            dataExpiracao = new Date(dataServ.getTime() + (ordem.garantia_dias * 24 * 60 * 60 * 1000));
            const hoje = new Date();
            if (dataExpiracao > hoje) {
                garantiaAtiva = true;
                diasRestantes = Math.ceil((dataExpiracao - hoje) / (1000 * 60 * 60 * 24));
            }
        }

        res.render('pages/public/garantia', {
            title: 'Garantia ' + ordem.numero_os, 
            layout: 'layouts/public',
            ordem, garantiaAtiva, diasRestantes, dataExpiracao
        });
    } catch (error) { next(error); }
};

exports.edit = (req, res, next) => {
    try {
        const ordem = OrdemServico.findById(req.params.id);
        if (!ordem) return res.redirect('/ordens');
        const clientes = Cliente.findAll();
        const dispositivos = Dispositivo.findAll();
        const tecnicos = Usuario.findAll().filter(u => u.role === 'tecnico' || u.role === 'admin');

        res.render('pages/ordens/edit', {
            title: 'Editar OS ' + ordem.numero_os, 
            layout: 'layouts/main',
            ordem, clientes, dispositivos, tecnicos, STATUS_OS, 
            error: null
        });
    } catch (error) { next(error); }
};

exports.update = (req, res, next) => {
    try {
        const dados = req.body;
        dados.valor_mao_obra = parseFloat(dados.valor_mao_obra) || 0;
        dados.valor_pecas = parseFloat(dados.valor_pecas) || 0;
        dados.valor_total = dados.valor_mao_obra + dados.valor_pecas;
        dados.garantia_dias = parseInt(dados.garantia_dias) || 90;
        OrdemServico.update(req.params.id, dados);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

exports.updateStatus = (req, res, next) => {
    try {
        const { status, observacao } = req.body;
        const usuarioId = req.session.user ? req.session.user.id : null;
        OrdemServico.updateStatus(req.params.id, status, observacao, usuarioId);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

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

exports.adicionarPecaEstoque = (req, res, next) => {
    try {
        const { peca_id, quantidade } = req.body;
        const usuarioId = req.session.user ? req.session.user.id : null;
        
        const resultado = OrdemServico.adicionarPecaEstoque(
            req.params.id,
            parseInt(peca_id),
            parseInt(quantidade) || 1,
            usuarioId
        );

        if (resultado.erro) {
            return res.redirect('/ordens/' + req.params.id + '?erro=' + encodeURIComponent(resultado.erro));
        }

        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

exports.removerPeca = (req, res, next) => {
    try {
        const usuarioId = req.session.user ? req.session.user.id : null;
        OrdemServico.removerPeca(req.params.pecaId, usuarioId);
        res.redirect('/ordens/' + req.params.id);
    } catch (error) { next(error); }
};

exports.destroy = (req, res, next) => {
    try {
        OrdemServico.delete(req.params.id);
        res.redirect('/ordens');
    } catch (error) { next(error); }
};
