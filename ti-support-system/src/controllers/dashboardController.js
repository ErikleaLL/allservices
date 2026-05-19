const Lead = require('../models/Lead');
const Cliente = require('../models/Cliente');
const Usuario = require('../models/Usuario');
const Dispositivo = require('../models/Dispositivo');
const OrdemServico = require('../models/OrdemServico');
const Peca = require('../models/Peca');
const Financeiro = require('../models/Financeiro');

// Dashboard principal (redireciona conforme perfil)
exports.index = (req, res) => {
    const user = req.session.user;

    if (user.role === 'admin') {
        return exports.admin(req, res);
    }

    if (user.role === 'tecnico') {
        return res.redirect('/dashboard/tecnico');
    }

    if (user.role === 'cliente') {
        return res.redirect('/dashboard/cliente');
    }

    return exports.admin(req, res);
};

// Dashboard Admin (com dados reais)
exports.admin = (req, res, next) => {
    try {
        // ===== ESTATÍSTICAS REAIS =====
        const resumoFin = Financeiro.resumo();
        const resumoMes = Financeiro.resumoMes();
        const totalClientes = Cliente.count();
        const totalUsuarios = Usuario.count();
        const totalLeads = Lead.count();
        const totalDispositivos = Dispositivo.count();
        const totalOS = OrdemServico.count();
        const estoqueStats = Peca.estatisticas();

        // OS por status
        const osPorStatus = OrdemServico.countByStatus();
        let osAbertas = 0;
        osPorStatus.forEach(s => {
            if (['orcamento', 'aprovada', 'em_execucao', 'aguardando_peca'].includes(s.status)) {
                osAbertas += s.total;
            }
        });

        // Dispositivos por status
        const dispositivosPorStatus = Dispositivo.countByStatus();
        let dispositivosAtivos = 0;
        dispositivosPorStatus.forEach(s => {
            if (s.status !== 'entregue') {
                dispositivosAtivos += s.total;
            }
        });

        // ===== ATIVIDADES RECENTES =====
        const ultimasOS = OrdemServico.findAll().slice(0, 5);
        const ultimosLeads = Lead.findAll().slice(0, 5);
        const ultimosClientes = Cliente.findAll().slice(0, 5);

        // ===== ATIVIDADE RECENTE (mix) =====
        const atividades = [];
        
        ultimosLeads.slice(0, 2).forEach(l => {
            atividades.push({
                tipo: 'lead',
                icone: 'ti-user-plus',
                cor: 'purple',
                texto: 'Novo lead: ' + l.nome,
                tempo: l.criado_em
            });
        });

        ultimosClientes.slice(0, 2).forEach(c => {
            atividades.push({
                tipo: 'cliente',
                icone: 'ti-user',
                cor: 'blue',
                texto: 'Cliente cadastrado: ' + c.nome,
                tempo: c.criado_em
            });
        });

        ultimasOS.slice(0, 2).forEach(o => {
            atividades.push({
                tipo: 'os',
                icone: 'ti-tools',
                cor: 'amber',
                texto: 'OS ' + o.numero_os + ' - ' + (o.cliente_nome || 'Cliente'),
                tempo: o.criado_em
            });
        });

        // Ordenar por data desc
        atividades.sort((a, b) => new Date(b.tempo) - new Date(a.tempo));

        res.render('pages/dashboard/admin', {
            title: 'Dashboard Administrativo',
            layout: 'layouts/main',
            stats: {
                receitaMes: resumoMes.receitas,
                saldoMes: resumoMes.saldo,
                osAbertas,
                totalClientes,
                totalEstoque: estoqueStats.totalItens,
                estoqueValor: estoqueStats.valorTotal,
                dispositivosAtivos,
                totalLeads,
                totalUsuarios,
                totalDispositivos,
                totalOS,
                aReceber: resumoFin.aReceber,
                aPagar: resumoFin.aPagar
            },
            ultimasOS: ultimasOS.slice(0, 4),
            atividades: atividades.slice(0, 4)
        });
    } catch (error) { next(error); }
};

// Dashboard Técnico
exports.tecnico = (req, res, next) => {
    try {
        const totalDispositivos = Dispositivo.count();
        const totalOS = OrdemServico.count();
        const ultimasOS = OrdemServico.findAll().slice(0, 5);

        res.render('pages/dashboard/admin', {
            title: 'Dashboard Técnico',
            layout: 'layouts/main',
            stats: {
                receitaMes: 0,
                saldoMes: 0,
                osAbertas: 0,
                totalClientes: 0,
                totalEstoque: 0,
                dispositivosAtivos: totalDispositivos,
                totalLeads: 0,
                totalDispositivos,
                totalOS,
                aReceber: 0,
                aPagar: 0
            },
            ultimasOS: ultimasOS.slice(0, 4),
            atividades: []
        });
    } catch (error) { next(error); }
};

// Dashboard Cliente
exports.cliente = (req, res, next) => {
    try {
        res.render('pages/dashboard/admin', {
            title: 'Dashboard',
            layout: 'layouts/main',
            stats: {
                receitaMes: 0, saldoMes: 0, osAbertas: 0,
                totalClientes: 0, totalEstoque: 0,
                dispositivosAtivos: 0, totalLeads: 0,
                totalDispositivos: 0, totalOS: 0,
                aReceber: 0, aPagar: 0
            },
            ultimasOS: [],
            atividades: []
        });
    } catch (error) { next(error); }
};
