const db = require('../config/database');

class Financeiro {

    // Listar todos
    static findAll() {
        return db.prepare(`
            SELECT 
                f.*,
                c.nome as cliente_nome,
                fo.nome as fornecedor_nome,
                os.numero_os
            FROM financeiro f
            LEFT JOIN clientes c ON f.cliente_id = c.id
            LEFT JOIN fornecedores fo ON f.fornecedor_id = fo.id
            LEFT JOIN ordens_servico os ON f.ordem_servico_id = os.id
            ORDER BY f.criado_em DESC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT 
                f.*,
                c.nome as cliente_nome,
                fo.nome as fornecedor_nome,
                os.numero_os
            FROM financeiro f
            LEFT JOIN clientes c ON f.cliente_id = c.id
            LEFT JOIN fornecedores fo ON f.fornecedor_id = fo.id
            LEFT JOIN ordens_servico os ON f.ordem_servico_id = os.id
            WHERE f.id = ?
        `).get(id);
    }

    // Filtrar por tipo (receita/despesa)
    static findByTipo(tipo) {
        return db.prepare(`
            SELECT * FROM financeiro 
            WHERE tipo = ? 
            ORDER BY data_vencimento DESC
        `).all(tipo);
    }

    // Criar lançamento
    static create({ 
        tipo, descricao, valor, categoria, 
        data_vencimento, data_pagamento, status,
        forma_pagamento, observacoes,
        cliente_id, fornecedor_id, ordem_servico_id 
    }) {
        const result = db.prepare(`
            INSERT INTO financeiro (
                tipo, descricao, valor, categoria,
                data_vencimento, data_pagamento, status,
                forma_pagamento, observacoes,
                cliente_id, fornecedor_id, ordem_servico_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            tipo, descricao, valor || 0, categoria || null,
            data_vencimento || null, data_pagamento || null, status || 'pendente',
            forma_pagamento || null, observacoes || null,
            cliente_id || null, fornecedor_id || null, ordem_servico_id || null
        );

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar
    static update(id, dados) {
        const {
            tipo, descricao, valor, categoria,
            data_vencimento, data_pagamento, status,
            forma_pagamento, observacoes,
            cliente_id, fornecedor_id
        } = dados;

        db.prepare(`
            UPDATE financeiro SET
                tipo = ?, descricao = ?, valor = ?, categoria = ?,
                data_vencimento = ?, data_pagamento = ?, status = ?,
                forma_pagamento = ?, observacoes = ?,
                cliente_id = ?, fornecedor_id = ?
            WHERE id = ?
        `).run(
            tipo, descricao, valor || 0, categoria || null,
            data_vencimento || null, data_pagamento || null, status,
            forma_pagamento || null, observacoes || null,
            cliente_id || null, fornecedor_id || null,
            id
        );

        return this.findById(id);
    }

    // Marcar como pago
    static marcarComoPago(id) {
        const hoje = new Date().toISOString().split('T')[0];
        db.prepare(`
            UPDATE financeiro SET status = 'pago', data_pagamento = ? WHERE id = ?
        `).run(hoje, id);
    }

    // Deletar
    static delete(id) {
        return db.prepare(`DELETE FROM financeiro WHERE id = ?`).run(id);
    }

    // ===== ESTATÍSTICAS =====

    // Resumo geral
    static resumo() {
        const totalReceitas = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'receita' AND status = 'pago'
        `).get().total;

        const totalDespesas = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'despesa' AND status = 'pago'
        `).get().total;

        const aReceber = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'receita' AND status = 'pendente'
        `).get().total;

        const aPagar = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'despesa' AND status = 'pendente'
        `).get().total;

        const vencidos = db.prepare(`
            SELECT COUNT(*) as total FROM financeiro 
            WHERE status = 'pendente' AND data_vencimento < date('now')
        `).get().total;

        return {
            totalReceitas,
            totalDespesas,
            saldo: totalReceitas - totalDespesas,
            aReceber,
            aPagar,
            saldoProjetado: (totalReceitas + aReceber) - (totalDespesas + aPagar),
            vencidos
        };
    }

    // Resumo do mês atual
    static resumoMes() {
        const receitas = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'receita' AND status = 'pago'
              AND strftime('%Y-%m', data_pagamento) = strftime('%Y-%m', 'now')
        `).get().total;

        const despesas = db.prepare(`
            SELECT COALESCE(SUM(valor), 0) as total FROM financeiro 
            WHERE tipo = 'despesa' AND status = 'pago'
              AND strftime('%Y-%m', data_pagamento) = strftime('%Y-%m', 'now')
        `).get().total;

        return {
            receitas,
            despesas,
            saldo: receitas - despesas
        };
    }

    // Lançamentos vencidos
    static vencidos() {
        return db.prepare(`
            SELECT * FROM financeiro 
            WHERE status = 'pendente' 
              AND data_vencimento < date('now')
            ORDER BY data_vencimento ASC
        `).all();
    }

    // Próximos vencimentos (7 dias)
    static proximosVencimentos() {
        return db.prepare(`
            SELECT * FROM financeiro 
            WHERE status = 'pendente'
              AND data_vencimento BETWEEN date('now') AND date('now', '+7 days')
            ORDER BY data_vencimento ASC
        `).all();
    }

    // Categorias mais usadas
    static topCategorias() {
        return db.prepare(`
            SELECT 
                categoria, 
                tipo,
                COUNT(*) as total,
                SUM(valor) as valor_total
            FROM financeiro
            WHERE categoria IS NOT NULL
            GROUP BY categoria, tipo
            ORDER BY valor_total DESC
            LIMIT 10
        `).all();
    }
}

module.exports = Financeiro;
