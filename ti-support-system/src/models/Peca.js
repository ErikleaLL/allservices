const db = require('../config/database');

class Peca {

    // Listar todas com categoria + fornecedor
    static findAll() {
        return db.prepare(`
            SELECT 
                p.*,
                c.nome as categoria_nome,
                f.nome as fornecedor_nome
            FROM pecas p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
            ORDER BY p.nome ASC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT 
                p.*,
                c.nome as categoria_nome,
                f.nome as fornecedor_nome,
                f.telefone as fornecedor_telefone
            FROM pecas p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN fornecedores f ON p.fornecedor_id = f.id
            WHERE p.id = ?
        `).get(id);
    }

    // Buscar peças com estoque baixo (≤ estoque_minimo)
    static comEstoqueBaixo() {
        return db.prepare(`
            SELECT 
                p.*,
                c.nome as categoria_nome
            FROM pecas p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.quantidade <= p.estoque_minimo
            ORDER BY p.quantidade ASC
        `).all();
    }

    // Buscar peças sem estoque (0)
    static semEstoque() {
        return db.prepare(`
            SELECT * FROM pecas WHERE quantidade = 0
        `).all();
    }

    // Criar nova peça
    static create({ 
        nome, categoria_id, fornecedor_id, 
        preco_custo, preco_venda, 
        quantidade, estoque_minimo 
    }) {
        const result = db.prepare(`
            INSERT INTO pecas 
                (nome, categoria_id, fornecedor_id, preco_custo, preco_venda, quantidade, estoque_minimo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            nome,
            categoria_id || null,
            fornecedor_id || null,
            preco_custo || 0,
            preco_venda || 0,
            quantidade || 0,
            estoque_minimo || 5
        );

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar peça
    static update(id, { nome, categoria_id, fornecedor_id, preco_custo, preco_venda, quantidade, estoque_minimo }) {
        db.prepare(`
            UPDATE pecas SET
                nome = ?, categoria_id = ?, fornecedor_id = ?,
                preco_custo = ?, preco_venda = ?,
                quantidade = ?, estoque_minimo = ?
            WHERE id = ?
        `).run(
            nome,
            categoria_id || null,
            fornecedor_id || null,
            preco_custo || 0,
            preco_venda || 0,
            quantidade || 0,
            estoque_minimo || 5,
            id
        );

        return this.findById(id);
    }

    // Movimentação de estoque
    static movimentar(pecaId, { tipo, quantidade, motivo, usuario_id }) {
        const peca = this.findById(pecaId);
        if (!peca) return null;

        let novaQuantidade = peca.quantidade;
        const qtd = parseInt(quantidade);

        if (tipo === 'entrada') {
            novaQuantidade += qtd;
        } else if (tipo === 'saida') {
            novaQuantidade -= qtd;
            if (novaQuantidade < 0) novaQuantidade = 0;
        }

        // Atualizar quantidade
        db.prepare(`UPDATE pecas SET quantidade = ? WHERE id = ?`).run(novaQuantidade, pecaId);

        // Registrar movimentação
        db.prepare(`
            INSERT INTO movimentacoes_estoque (peca_id, tipo, quantidade, motivo, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(pecaId, tipo, qtd, motivo || null, usuario_id || null);

        return this.findById(pecaId);
    }

    // Buscar movimentações da peça
    static getMovimentacoes(pecaId) {
        return db.prepare(`
            SELECT 
                m.*,
                u.nome as usuario_nome
            FROM movimentacoes_estoque m
            LEFT JOIN usuarios u ON m.usuario_id = u.id
            WHERE m.peca_id = ?
            ORDER BY m.criado_em DESC
            LIMIT 50
        `).all(pecaId);
    }

    // Deletar peça
    static delete(id) {
        return db.prepare(`DELETE FROM pecas WHERE id = ?`).run(id);
    }

    // Contar total
    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM pecas`).get().total;
    }

    // Estatísticas
    static estatisticas() {
        const total = this.count();
        const baixoEstoque = db.prepare(`SELECT COUNT(*) as t FROM pecas WHERE quantidade <= estoque_minimo AND quantidade > 0`).get().t;
        const semEstoque = db.prepare(`SELECT COUNT(*) as t FROM pecas WHERE quantidade = 0`).get().t;
        const valorTotal = db.prepare(`SELECT COALESCE(SUM(quantidade * preco_custo), 0) as v FROM pecas`).get().v;
        const valorVenda = db.prepare(`SELECT COALESCE(SUM(quantidade * preco_venda), 0) as v FROM pecas`).get().v;

        return {
            totalItens: total,
            baixoEstoque,
            semEstoque,
            valorTotal,
            valorVenda,
            lucroEstimado: valorVenda - valorTotal
        };
    }
}

module.exports = Peca;
