const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Usuario {

    // Buscar todos
    static findAll() {
        return db.prepare(`
            SELECT id, nome, email, role, ativo, criado_em 
            FROM usuarios 
            ORDER BY criado_em DESC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT id, nome, email, role, ativo, criado_em 
            FROM usuarios 
            WHERE id = ?
        `).get(id);
    }

    // Buscar por email
    static findByEmail(email) {
        return db.prepare(`
            SELECT * FROM usuarios WHERE email = ?
        `).get(email);
    }

    // Criar novo usuário
    static create({ nome, email, senha, role = 'cliente' }) {
        const hashedPassword = bcrypt.hashSync(senha, 10);

        const result = db.prepare(`
            INSERT INTO usuarios (nome, email, senha, role)
            VALUES (?, ?, ?, ?)
        `).run(nome, email, hashedPassword, role);

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar
    static update(id, { nome, email, role, ativo }) {
        db.prepare(`
            UPDATE usuarios 
            SET nome = ?, email = ?, role = ?, ativo = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(nome, email, role, ativo, id);

        return this.findById(id);
    }

    // Atualizar senha
    static updatePassword(id, novaSenha) {
        const hashedPassword = bcrypt.hashSync(novaSenha, 10);

        return db.prepare(`
            UPDATE usuarios 
            SET senha = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(hashedPassword, id);
    }

    // Deletar
    static delete(id) {
        return db.prepare(`DELETE FROM usuarios WHERE id = ?`).run(id);
    }

    // Validar senha
    static checkPassword(senhaDigitada, senhaHash) {
        return bcrypt.compareSync(senhaDigitada, senhaHash);
    }

    // Contar usuários
    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM usuarios`).get().total;
    }
}

module.exports = Usuario;
