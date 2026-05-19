const db = require('../config/database');

class Fornecedor {

    static findAll() {
        return db.prepare(`
            SELECT 
                f.*,
                (SELECT COUNT(*) FROM pecas WHERE fornecedor_id = f.id) as total_pecas
            FROM fornecedores f
            ORDER BY f.nome ASC
        `).all();
    }

    static findById(id) {
        return db.prepare(`SELECT * FROM fornecedores WHERE id = ?`).get(id);
    }

    static create({ nome, email, telefone, cnpj, endereco }) {
        const result = db.prepare(`
            INSERT INTO fornecedores (nome, email, telefone, cnpj, endereco)
            VALUES (?, ?, ?, ?, ?)
        `).run(nome, email || null, telefone || null, cnpj || null, endereco || null);
        return this.findById(result.lastInsertRowid);
    }

    static update(id, { nome, email, telefone, cnpj, endereco }) {
        db.prepare(`
            UPDATE fornecedores 
            SET nome = ?, email = ?, telefone = ?, cnpj = ?, endereco = ?
            WHERE id = ?
        `).run(nome, email || null, telefone || null, cnpj || null, endereco || null, id);
        return this.findById(id);
    }

    static delete(id) {
        return db.prepare(`DELETE FROM fornecedores WHERE id = ?`).run(id);
    }

    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM fornecedores`).get().total;
    }
}

module.exports = Fornecedor;
