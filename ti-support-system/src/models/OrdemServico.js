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
                SELECT 
                    op.*,
                    p.nome as peca_nome,
                    p.quantidade as estoque_atual
                FROM os_pecas op
                LEFT JOIN pecas p ON op.peca_id = p.id
                WHERE op.ordem_servico_id = ? 
                ORDER BY op.id ASC
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
            os.pecas = db.prepare(`SELECT * FROM os_pecas WHERE ordem_servico_id = ? ORDER BY id ASC`).all(os.id);
        }

        return os;
    }

    static findByDispositivo(dispositivoId) {
        return db.prepare(`SELECT * FROM ordens_servico WHERE dispositivo_id = ? ORDER BY criado_em DESC`).all(dispositivoId);
    }

    static findByCliente(clienteId) {
        return db.prepare(`SELECT * FROM ordens_servico WHERE cliente_id = ? ORDER BY criado_em DESC`).all(clienteId);
    }

    static gerarNumeroOS() {
        const ano = new Date().getFullYear();
        const ultima = db.prepare(`SELECT numero_os FROM ordens_servico WHERE numero_os LIKE ? ORDER BY id DESC LIMIT 1`).get(`OS-${ano}-%`);
        let proximo = 1;
        if (ultima && ultima.numero_os) {
            const partes = ultima.numero_os.split('-');
            proximo = parseInt(partes[2]) + 1;
        }
        return `OS-${ano}-${String(proximo).padStart(3, '0')}`;
    }

    static gerarCodigoGarantia() {
        return 'GAR-' + crypto.randomBytes(5).toString('hex').toUpperCase();
    }

    static create({ dispositivo_id, cliente_id, tecnico_id, diagnostico, descricao_servico, valor_mao_obra, valor_pecas, valor_total, prazo_entrega, observacoes_internas, observacoes_publicas, garantia_dias }) {
        const numero_os = this.gerarNumeroOS();
        const qr_code_garantia = this.gerarCodigoGarantia();

        const result = db.prepare(`
            INSERT INTO ordens_servico (
                numero_os, qr_code_garantia, dispositivo_id, cliente_id, tecnico_id,
                diagnostico, descricao_servico, valor_mao_obra, valor_pecas, valor_total,
                prazo_entrega, observacoes_internas, observacoes_publicas, garantia_dias, status
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
        const { dispositivo_id, cliente_id, tecnico_id, diagnostico, descricao_servico, solucao, valor_mao_obra, valor_pecas, valor_total, prazo_entrega, observacoes_internas, observacoes_publicas, garantia_dias, status } = dados;

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
            garantia_dias || 90, status, id
        );

        if (atual && atual.status !== status) {
            this.registrarHistorico(id, atual.status, status, 'Status alterado', null);
            
            // 🎯 NOVO: Se mudou para "entregue", criar lançamento financeiro
            if (status === 'entregue' && atual.status !== 'entregue') {
                this.criarLancamentoFinanceiro(id);
            }
        }

        return this.findById(id);
    }

    static updateStatus(id, novoStatus, observacao, usuarioId) {
        const atual = db.prepare('SELECT status FROM ordens_servico WHERE id = ?').get(id);
        db.prepare(`UPDATE ordens_servico SET status = ? WHERE id = ?`).run(novoStatus, id);
        
        if (novoStatus === 'entregue') {
            db.prepare(`UPDATE ordens_servico SET concluido_em = CURRENT_TIMESTAMP WHERE id = ?`).run(id);
            
            // 🎯 NOVO: Criar lançamento financeiro automaticamente
            if (atual && atual.status !== 'entregue') {
                this.criarLancamentoFinanceiro(id);
            }
        }
        
        if (atual) {
            this.registrarHistorico(id, atual.status, novoStatus, observacao, usuarioId);
        }
    }

    // 🎯 NOVO MÉTODO: Criar lançamento financeiro automático
    static criarLancamentoFinanceiro(osId) {
        const os = this.findById(osId);
        if (!os || !os.valor_total || os.valor_total <= 0) return;

        // Verifica se já existe um lançamento para esta OS
        const jaExiste = db.prepare(`
            SELECT id FROM financeiro WHERE ordem_servico_id = ?
        `).get(osId);

        if (jaExiste) return;

        // Cria o lançamento
        const hoje = new Date().toISOString().split('T')[0];
        const descricao = `OS ${os.numero_os} - ${os.cliente_nome || 'Cliente'}`;

        db.prepare(`
            INSERT INTO financeiro (
                tipo, descricao, valor, categoria,
                data_vencimento, data_pagamento, status,
                cliente_id, ordem_servico_id
            ) VALUES ('receita', ?, ?, 'Serviço Técnico', ?, ?, 'pago', ?, ?)
        `).run(
            descricao,
            os.valor_total,
            hoje,
            hoje,
            os.cliente_id,
            osId
        );
    }

    static delete(id) {
        const pecas = db.prepare(`SELECT peca_id, quantidade FROM os_pecas WHERE ordem_servico_id = ? AND peca_id IS NOT NULL`).all(id);
        pecas.forEach(p => {
            if (p.peca_id) {
                db.prepare(`UPDATE pecas SET quantidade = quantidade + ? WHERE id = ?`).run(p.quantidade, p.peca_id);
            }
        });
        
        // 🎯 NOVO: Excluir lançamento financeiro vinculado
        db.prepare(`DELETE FROM financeiro WHERE ordem_servico_id = ?`).run(id);
        
        return db.prepare(`DELETE FROM ordens_servico WHERE id = ?`).run(id);
    }

    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM ordens_servico`).get().total;
    }

    static countByStatus() {
        return db.prepare(`SELECT status, COUNT(*) as total FROM ordens_servico GROUP BY status`).all();
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

    static adicionarPecaEstoque(osId, pecaId, quantidade, usuarioId) {
        const peca = db.prepare(`SELECT * FROM pecas WHERE id = ?`).get(pecaId);
        if (!peca) return { erro: 'Peça não encontrada' };

        if (peca.quantidade < quantidade) {
            return { erro: `Estoque insuficiente. Disponível: ${peca.quantidade}` };
        }

        const valor_unitario = peca.preco_venda || 0;
        const valor_total = quantidade * valor_unitario;

        db.prepare(`
            INSERT INTO os_pecas (ordem_servico_id, peca_id, descricao, quantidade, valor_unitario, valor_total)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(osId, pecaId, peca.nome, quantidade, valor_unitario, valor_total);

        db.prepare(`UPDATE pecas SET quantidade = quantidade - ? WHERE id = ?`).run(quantidade, pecaId);

        db.prepare(`
            INSERT INTO movimentacoes_estoque (peca_id, tipo, quantidade, motivo, usuario_id)
            VALUES (?, 'saida', ?, ?, ?)
        `).run(pecaId, quantidade, `Usado na OS #${osId}`, usuarioId || null);

        this.recalcularTotal(osId);
        return { sucesso: true };
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

    static removerPeca(pecaId, usuarioId) {
        const item = db.prepare(`SELECT * FROM os_pecas WHERE id = ?`).get(pecaId);
        if (!item) return;

        if (item.peca_id) {
            db.prepare(`UPDATE pecas SET quantidade = quantidade + ? WHERE id = ?`).run(item.quantidade, item.peca_id);
            db.prepare(`
                INSERT INTO movimentacoes_estoque (peca_id, tipo, quantidade, motivo, usuario_id)
                VALUES (?, 'entrada', ?, ?, ?)
            `).run(item.peca_id, item.quantidade, `Devolvido da OS #${item.ordem_servico_id}`, usuarioId || null);
        }

        db.prepare('DELETE FROM os_pecas WHERE id = ?').run(pecaId);
        this.recalcularTotal(item.ordem_servico_id);
    }

    static recalcularTotal(osId) {
        const totalPecas = db.prepare(`SELECT COALESCE(SUM(valor_total), 0) as total FROM os_pecas WHERE ordem_servico_id = ?`).get(osId).total;
        const os = db.prepare(`SELECT valor_mao_obra FROM ordens_servico WHERE id = ?`).get(osId);
        const total = (os.valor_mao_obra || 0) + totalPecas;
        db.prepare(`UPDATE ordens_servico SET valor_pecas = ?, valor_total = ? WHERE id = ?`).run(totalPecas, total, osId);
    }

    static registrarHistorico(osId, statusAnterior, statusNovo, observacao, usuarioId) {
        db.prepare(`
            INSERT INTO os_historico (ordem_servico_id, status_anterior, status_novo, observacao, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(osId, statusAnterior, statusNovo, observacao || null, usuarioId || null);
    }
}

module.exports = OrdemServico;
