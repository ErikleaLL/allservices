const db = require('../config/database');

class Lead {

    // Listar todos os leads
    static findAll() {
        return db.prepare(`
            SELECT * FROM leads 
            ORDER BY criado_em DESC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT * FROM leads WHERE id = ?
        `).get(id);
    }

    // Buscar por status
    static findByStatus(status) {
        return db.prepare(`
            SELECT * FROM leads 
            WHERE status = ?
            ORDER BY criado_em DESC
        `).all(status);
    }

    // Criar novo lead
    static create({ nome, email, whatsapp, empresa, interesse, mensagem, origem = 'site' }) {
        const result = db.prepare(`
            INSERT INTO leads (nome, email, whatsapp, empresa, interesse, mensagem, origem)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(nome, email, whatsapp, empresa, interesse, mensagem, origem);

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar status (novo, contatado, em_negociacao, convertido, perdido)
    static updateStatus(id, status) {
        return db.prepare(`
            UPDATE leads 
            SET status = ?, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(status, id);
    }

    // Deletar lead
    static delete(id) {
        return db.prepare(`DELETE FROM leads WHERE id = ?`).run(id);
    }

    // Contar total
    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM leads`).get().total;
    }

    // Contar por status
    static countByStatus() {
        return db.prepare(`
            SELECT status, COUNT(*) as total 
            FROM leads 
            GROUP BY status
        `).all();
    }

    // Leads recentes (últimos 7 dias)
    static recentes() {
        return db.prepare(`
            SELECT * FROM leads 
            WHERE criado_em >= datetime('now', '-7 days')
            ORDER BY criado_em DESC
        `).all();
    }
}

module.exports = Lead;
