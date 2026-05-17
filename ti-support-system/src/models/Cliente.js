const db = require('../config/database');

class Cliente {

    // Listar todos
    static findAll() {
        return db.prepare(`
            SELECT * FROM clientes 
            ORDER BY criado_em DESC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT * FROM clientes WHERE id = ?
        `).get(id);
    }

    // Buscar por email
    static findByEmail(email) {
        return db.prepare(`
            SELECT * FROM clientes WHERE email = ?
        `).get(email);
    }

    // Buscar por CPF/CNPJ
    static findByDocumento(cpf_cnpj) {
        return db.prepare(`
            SELECT * FROM clientes WHERE cpf_cnpj = ?
        `).get(cpf_cnpj);
    }

    // Criar novo cliente
    static create({ nome, email, telefone, cpf_cnpj, endereco, usuario_id = null }) {
        const result = db.prepare(`
            INSERT INTO clientes (nome, email, telefone, cpf_cnpj, endereco, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(nome, email, telefone, cpf_cnpj, endereco, usuario_id);

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar cliente
    static update(id, { nome, email, telefone, cpf_cnpj, endereco }) {
        db.prepare(`
            UPDATE clientes 
            SET nome = ?, email = ?, telefone = ?, cpf_cnpj = ?, endereco = ?
            WHERE id = ?
        `).run(nome, email, telefone, cpf_cnpj, endereco, id);

        return this.findById(id);
    }

    // Deletar cliente
    static delete(id) {
        return db.prepare(`DELETE FROM clientes WHERE id = ?`).run(id);
    }

    // Contar total
    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM clientes`).get().total;
    }

    // Buscar clientes recentes (últimos 30 dias)
    static recentes() {
        return db.prepare(`
            SELECT * FROM clientes 
            WHERE criado_em >= datetime('now', '-30 days')
            ORDER BY criado_em DESC
        `).all();
    }
}

module.exports = Cliente;
