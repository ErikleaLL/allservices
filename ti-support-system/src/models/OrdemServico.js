const db = require('../config/database');
const crypto = require('crypto');

class OrdemServico {

    static findAll() {
        return db.prepare(`
            SELECT 
                os.*,
                c.nome as cliente_nome,
                c.telefone as cliente_telefone,
                d.tipo as dispositivo_tipo,
                d.marca as dispositivo_marca,
                d.modelo as dispositivo_modelo,
                d.qr_code as dispositivo_qr_code,
                u.nome as tecnico_nome
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN dispositivos d ON os.dispositivo_id = d.id
            LEFT JOIN usuarios u ON os.tecnico_id = u.id
            ORDER BY os.criado_em DESC
        `).all();
    }

    static findById(id) {
        const os = db.prepare(`
            SELECT 
                os.*,
                c.nome as cliente_nome,
                c.email as cliente_email,
                c.telefone as cliente_telefone,
                c.cpf_cnpj as cliente_cpf,
                d.tipo as dispositivo_tipo,
                d.marca as dispositivo_marca,
                d.modelo as dispositivo_modelo,
                d.numero_serie as dispositivo_serie,
                d.problema_relato as dispositivo_problema,
                d.qr_code as dispositivo_qr_code,
                u.nome as tecnico_nome
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN dispositivos d ON os.dispositivo_id = d.id
            LEFT JOIN usuarios u ON os.tecnico_id = u.id
            WHERE os.id = ?
        `).get(id);

        if (os) {
            os.pecas = db.prepare(`
                SELECT * FROM os_pecas WHERE ordem_servico_id = ? ORDER BY id ASC
            `).all(id);

            os.historico = db.prepare(`
                SELECT h.*, u.nome as usuario_nome
                FROM os_historico h
                LEFT JOIN usuarios u ON h.usuario_id = u.id
                WHERE h.ordem_servico_id = ?
                ORDER BY h.criado_em DESC
            `).all(id);
        }

        return os;
    }

    // 🎯 NOVO: Buscar OS pelo QR Code de garantia
    static findByQrGarantia(qrCode) {
        const os = db.prepare(`
            SELECT 
                os.*,
                c.nome as cliente_nome,
                c.telefone as cliente_telefone,
                d.tipo as dispositivo_tipo,
                d.marca as dispositivo_marca,
                d.modelo as dispositivo_modelo,
                d.numero_serie as dispositivo_serie,
                u.nome as tecnico_nome
            FROM ordens_servico os
            LEFT JOIN clientes c ON os.cliente_id = c.id
            LEFT JOIN dispositivos d ON os.dispositivo_id = d.id
            LEFT JOIN usuarios u ON os.tecnico_id = u.id
            WHERE os.qr_code_garantia = ?
        `).get(qrCode);

        if (os) {
            os.pecas = db.prepare(`
                SELECT * FROM os_pecas WHERE ordem_servico_id = ? ORDER BY id ASC
            `).all(os.id);
        }

        return os;
    }

    static findByDispositivo(dispositivoId) {
        return db.prepare(`
            SELECT * FROM ordens_servico 
            WHERE dispositivo_id = ?
            ORDER BY criado_em DESC
        `).all(dispositivoId);
    }

    static findByCliente(clienteId) {
        return db.prepare(`
            SELECT * FROM ordens_servico 
            WHERE cliente_id = ?
            ORDER BY criado_em DESC
        `).all(clienteId);
    }

    static gerarNumeroOS() {
        const ano = new Date().getFullYear();
        const ultima = db.prepare(`
            SELECT numero_os FROM ordens_servico 
            WHERE numero_os LIKE ? 
            ORDER BY id DESC LIMIT 1
        `).get(`OS-${ano}-%`);

        let proximo = 1;
        if (ultima && ultima.numero_os) {
            const partes = ultima.numero_os.split('-');
            proximo = parseInt(partes[2]) + 1;
        }

        return `OS-${ano}-${String(proximo).padStart(3, '0')}`;
    }

    // 🎯 NOVO: Gerar código único de garantia
    static gerarCodigoGarantia() {
        return 'GAR-' + crypto.randomBytes(5).toString('hex').toUpperCase();
    }

    static create({ 
        dispositivo_id, cliente_id, tecnico_id, 
        diagnostico, descricao_servico, 
        valor_mao_obra, valor_pecas, valor_total,
        prazo_entrega, observacoes_internas, observacoes_publicas,
        garantia_dias 
    }) {
        const numero_os = this.gerarNumeroOS();
        const qr_code_garantia = this.gerarCodigoGarantia();

        const result = db.prepare(`
            INSERT INTO ordens_servico (
                numero_os, qr_code_garantia, dispositivo_id, cliente_id, tecnico_id,
                diagnostico, descricao_servico,
                valor_mao_obra, valor_pecas, valor_total,
                prazo_entrega, observacoes_internas, observacoes_publicas,
                garantia_dias, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'orcamento')
        `).run(
            numero_os, qr_code_garantia, dispositivo_id, cliente_id, tecnico_id || null,
            diagnostico || null, descricao_servico || null,
            valor_mao_obra || 0, valor_pecas || 0, valor_total || 0,
            prazo_entrega || null, observacoes_internas || null, observacoes_publicas || null,
            garantia_dias || 90
        );

        this.registrarHistorico(result.lastInsertRowid, null, 'orcamento', 'OS criada', null);

        return this.findById(result.lastInsertRowid);
    }

    static update(id, dados) {
        const {
            dispositivo_id, cliente_id, tecnico_id,
            diagnostico, descricao_servico, solucao,
            valor_mao_obra, valor_pecas, valor_total,
            prazo_entrega, observacoes_internas, observacoes_publicas,
            garantia_dias, status
        } = dados;

        const atual = db.prepare('SELECT status FROM ordens_servico WHERE id = ?').get(id);

        db.prepare(`
            UPDATE ordens_servico SET
                dispositivo_id = ?, cliente_id = ?, tecnico_id = ?,
                diagnostico = ?, descricao_servico = ?, solucao = ?,
                valor_mao_obra = ?, valor_pecas = ?, valor_total = ?,
                prazo_entrega = ?, observacoes_internas = ?, observacoes_publicas = ?,
                garantia_dias = ?, status = ?
            WHERE id = ?
        `).run(
            dispositivo_id, cliente_id, tecnico_id || null,
            diagnostico || null, descricao_servico || null, solucao || null,
            valor_mao_obra || 0, valor_pecas || 0, valor_total || 0,
            prazo_entrega || null, observacoes_internas || null, observacoes_publicas || null,
            garantia_dias || 90, status,
            id
        );

        if (atual && atual.status !== status) {
            this.registrarHistorico(id, atual.status, status, 'Status alterado', null);
        }

        return this.findById(id);
    }

    static updateStatus(id, novoStatus, observacao, usuarioId) {
        const atual = db.prepare('SELECT status FROM ordens_servico WHERE id = ?').get(id);
        
        db.prepare(`UPDATE ordens_servico SET status = ? WHERE id = ?`).run(novoStatus, id);
        
        if (novoStatus === 'entregue') {
            db.prepare(`UPDATE ordens_servico SET concluido_em = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
        }

        if (atual) {
            this.registrarHistorico(id, atual.status, novoStatus, observacao, usuarioId);
        }
    }

    static delete(id) {
        return db.prepare(`DELETE FROM ordens_servico WHERE id = ?`).run(id);
    }

    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM ordens_servico`).get().total;
    }

    static countByStatus() {
        return db.prepare(`
            SELECT status, COUNT(*) as total 
            FROM ordens_servico 
            GROUP BY status
        `).all();
    }

    static receitaDoMes() {
        const result = db.prepare(`
            SELECT COALESCE(SUM(valor_total), 0) as total
            FROM ordens_servico
            WHERE status = 'entregue'
              AND strftime('%Y-%m', concluido_em) = strftime('%Y-%m', 'now')
        `).get();
        return result.total || 0;
    }

    static adicionarPeca(osId, { descricao, quantidade, valor_unitario }) {
        const valor_total = quantidade * valor_unitario;
        
        const result = db.prepare(`
            INSERT INTO os_pecas (ordem_servico_id, descricao, quantidade, valor_unitario, valor_total)
            VALUES (?, ?, ?, ?, ?)
        `).run(osId, descricao, quantidade, valor_unitario, valor_total);

        this.recalcularTotal(osId);

        return result.lastInsertRowid;
    }

    static removerPeca(pecaId) {
        const peca = db.prepare('SELECT ordem_servico_id FROM os_pecas WHERE id = ?').get(pecaId);
        if (peca) {
            db.prepare('DELETE FROM os_pecas WHERE id = ?').run(pecaId);
            this.recalcularTotal(peca.ordem_servico_id);
        }
    }

    static recalcularTotal(osId) {
        const totalPecas = db.prepare(`
            SELECT COALESCE(SUM(valor_total), 0) as total
            FROM os_pecas WHERE ordem_servico_id = ?
        `).get(osId).total;

        const os = db.prepare(`SELECT valor_mao_obra FROM ordens_servico WHERE id = ?`).get(osId);
        const total = (os.valor_mao_obra || 0) + totalPecas;

        db.prepare(`
            UPDATE ordens_servico 
            SET valor_pecas = ?, valor_total = ?
            WHERE id = ?
        `).run(totalPecas, total, osId);
    }

    static registrarHistorico(osId, statusAnterior, statusNovo, observacao, usuarioId) {
        db.prepare(`
            INSERT INTO os_historico (ordem_servico_id, status_anterior, status_novo, observacao, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(osId, statusAnterior, statusNovo, observacao || null, usuarioId || null);
    }
}

module.exports = OrdemServico;
