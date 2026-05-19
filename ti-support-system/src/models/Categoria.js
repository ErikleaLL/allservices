const db = require('../config/database');

class Categoria {

    static findAll() {
        return db.prepare(`
            SELECT 
                c.*,
                (SELECT COUNT(*) FROM pecas WHERE categoria_id = c.id) as total_pecas
            FROM categorias c
            ORDER BY c.nome ASC
        `).all();
    }

    static findById(id) {
        return db.prepare(`SELECT * FROM categorias WHERE id = ?`).get(id);
    }

    static create({ nome, descricao }) {
        const result = db.prepare(`
            INSERT INTO categorias (nome, descricao) VALUES (?, ?)
        `).run(nome, descricao || null);
        return this.findById(result.lastInsertRowid);
    }

    static update(id, { nome, descricao }) {
        db.prepare(`
            UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?
        `).run(nome, descricao || null, id);
        return this.findById(id);
    }

    static delete(id) {
        return db.prepare(`DELETE FROM categorias WHERE id = ?`).run(id);
    }

    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM categorias`).get().total;
    }
}

module.exports = Categoria;
