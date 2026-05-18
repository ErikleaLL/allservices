const Dispositivo = require('../models/Dispositivo');
const Cliente = require('../models/Cliente');
const QRCode = require('qrcode');

// Status disponíveis com cor e label
const STATUS_LIST = {
    'entrada':           { label: 'Entrada',           cor: '#60a5fa', icone: 'ti-package' },
    'diagnostico':       { label: 'Em Diagnóstico',    cor: '#fbbf24', icone: 'ti-search' },
    'aguardando_pecas':  { label: 'Aguardando Peças',  cor: '#f97316', icone: 'ti-clock' },
    'em_reparo':         { label: 'Em Reparo',         cor: '#a78bfa', icone: 'ti-tools' },
    'pronto':            { label: 'Pronto p/ Retirada',cor: '#4ade80', icone: 'ti-check' },
    'entregue':          { label: 'Entregue',          cor: '#94a3b8', icone: 'ti-truck-delivery' }
};

// Listar todos
exports.index = (req, res, next) => {
    try {
        const dispositivos = Dispositivo.findAll();
        const total = Dispositivo.count();

        res.render('pages/dispositivos/index', {
            title: 'Dispositivos',
            layout: 'layouts/main',
            dispositivos,
            total,
            STATUS_LIST
        });
    } catch (error) {
        next(error);
    }
};

// Formulário novo dispositivo
exports.create = (req, res, next) => {
    try {
        const clientes = Cliente.findAll();

        res.render('pages/dispositivos/create', {
            title: 'Novo Dispositivo',
            layout: 'layouts/main',
            clientes,
            error: null
        });
    } catch (error) {
        next(error);
    }
};

// Salvar novo dispositivo
exports.store = (req, res, next) => {
    try {
        const { cliente_id, tipo, marca, modelo, numero_serie, problema_relato } = req.body;

        if (!cliente_id || !tipo) {
            const clientes = Cliente.findAll();
            return res.render('pages/dispositivos/create', {
                title: 'Novo Dispositivo',
                layout: 'layouts/main',
                clientes,
                error: 'Cliente e Tipo são obrigatórios.'
            });
        }

        const novo = Dispositivo.create({ 
            cliente_id, tipo, marca, modelo, numero_serie, problema_relato 
        });

        res.redirect('/dispositivos/' + novo.id);
    } catch (error) {
        next(error);
    }
};

// Ver detalhes (com QR Code gerado)
exports.show = async (req, res, next) => {
    try {
        const dispositivo = Dispositivo.findById(req.params.id);
        if (!dispositivo) return res.redirect('/dispositivos');

        // Gera URL pública de rastreamento
        const baseUrl = req.protocol + '://' + req.get('host');
        const urlRastreio = baseUrl + '/rastreio/' + dispositivo.qr_code;

        // Gera QR Code como base64 (imagem)
        const qrImage = await QRCode.toDataURL(urlRastreio, {
            width: 300,
            margin: 2,
            color: {
                dark: '#0a0a0f',
                light: '#ffffff'
            }
        });

        res.render('pages/dispositivos/show', {
            title: 'Dispositivo #' + dispositivo.id,
            layout: 'layouts/main',
            dispositivo,
            qrImage,
            urlRastreio,
            STATUS_LIST
        });
    } catch (error) {
        next(error);
    }
};

// Tela de impressão de etiqueta
exports.etiqueta = async (req, res, next) => {
    try {
        const dispositivo = Dispositivo.findById(req.params.id);
        if (!dispositivo) return res.redirect('/dispositivos');

        const baseUrl = req.protocol + '://' + req.get('host');
        const urlRastreio = baseUrl + '/rastreio/' + dispositivo.qr_code;

        const qrImage = await QRCode.toDataURL(urlRastreio, {
            width: 400,
            margin: 1,
            color: { dark: '#000', light: '#fff' }
        });

        res.render('pages/dispositivos/etiqueta', {
            title: 'Etiqueta - ' + dispositivo.qr_code,
            layout: false,
            dispositivo,
            qrImage,
            urlRastreio
        });
    } catch (error) {
        next(error);
    }
};

// Formulário de edição
exports.edit = (req, res, next) => {
    try {
        const dispositivo = Dispositivo.findById(req.params.id);
        if (!dispositivo) return res.redirect('/dispositivos');

        const clientes = Cliente.findAll();

        res.render('pages/dispositivos/edit', {
            title: 'Editar Dispositivo',
            layout: 'layouts/main',
            dispositivo,
            clientes,
            STATUS_LIST,
            error: null
        });
    } catch (error) {
        next(error);
    }
};

// Atualizar dispositivo completo
exports.update = (req, res, next) => {
    try {
        const { cliente_id, tipo, marca, modelo, numero_serie, problema_relato, status } = req.body;

        Dispositivo.update(req.params.id, {
            cliente_id, tipo, marca, modelo, numero_serie, problema_relato, status
        });

        res.redirect('/dispositivos/' + req.params.id);
    } catch (error) {
        next(error);
    }
};

// Atualizar apenas status
exports.updateStatus = (req, res, next) => {
    try {
        Dispositivo.updateStatus(req.params.id, req.body.status);
        res.redirect('/dispositivos/' + req.params.id);
    } catch (error) {
        next(error);
    }
};

// Deletar
exports.destroy = (req, res, next) => {
    try {
        Dispositivo.delete(req.params.id);
        res.redirect('/dispositivos');
    } catch (error) {
        next(error);
    }
};

// 🌐 PÁGINA PÚBLICA DE RASTREAMENTO (QR Code)
exports.rastreio = (req, res, next) => {
    try {
        const dispositivo = Dispositivo.findByQrCode(req.params.qrcode);

        if (!dispositivo) {
            return res.status(404).render('pages/public/rastreio-naoencontrado', {
                title: 'Dispositivo não encontrado',
                layout: 'layouts/public'
            });
        }

        res.render('pages/public/rastreio', {
            title: 'Acompanhamento - ' + dispositivo.qr_code,
            layout: 'layouts/public',
            dispositivo,
            STATUS_LIST
        });
    } catch (error) {
        next(error);
    }
};
