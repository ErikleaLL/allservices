const db = require('../config/database');
const crypto = require('crypto');

class Dispositivo {

    // Listar todos com nome do cliente
    static findAll() {
        return db.prepare(`
            SELECT 
                d.*,
                c.nome as cliente_nome,
                c.telefone as cliente_telefone
            FROM dispositivos d
            LEFT JOIN clientes c ON d.cliente_id = c.id
            ORDER BY d.criado_em DESC
        `).all();
    }

    // Buscar por ID
    static findById(id) {
        return db.prepare(`
            SELECT 
                d.*,
                c.nome as cliente_nome,
                c.email as cliente_email,
                c.telefone as cliente_telefone
            FROM dispositivos d
            LEFT JOIN clientes c ON d.cliente_id = c.id
            WHERE d.id = ?
        `).get(id);
    }

    // Buscar por código QR (rastreamento público)
    static findByQrCode(qrCode) {
        return db.prepare(`
            SELECT 
                d.*,
                c.nome as cliente_nome
            FROM dispositivos d
            LEFT JOIN clientes c ON d.cliente_id = c.id
            WHERE d.qr_code = ?
        `).get(qrCode);
    }

    // Buscar dispositivos de um cliente
    static findByCliente(clienteId) {
        return db.prepare(`
            SELECT * FROM dispositivos 
            WHERE cliente_id = ?
            ORDER BY criado_em DESC
        `).all(clienteId);
    }

    // Criar novo dispositivo
    static create({ cliente_id, tipo, marca, modelo, numero_serie, problema_relato }) {
        // Gera código único de rastreamento
        const qr_code = this.gerarCodigoUnico();

        const result = db.prepare(`
            INSERT INTO dispositivos 
                (cliente_id, tipo, marca, modelo, numero_serie, problema_relato, qr_code, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'entrada')
        `).run(cliente_id, tipo, marca, modelo, numero_serie, problema_relato, qr_code);

        return this.findById(result.lastInsertRowid);
    }

    // Atualizar dispositivo
    static update(id, { cliente_id, tipo, marca, modelo, numero_serie, problema_relato, status }) {
        db.prepare(`
            UPDATE dispositivos 
            SET cliente_id = ?, tipo = ?, marca = ?, modelo = ?, 
                numero_serie = ?, problema_relato = ?, status = ?
            WHERE id = ?
        `).run(cliente_id, tipo, marca, modelo, numero_serie, problema_relato, status, id);

        return this.findById(id);
    }

    // Atualizar apenas o status
    static updateStatus(id, status) {
        return db.prepare(`
            UPDATE dispositivos SET status = ? WHERE id = ?
        `).run(status, id);
    }

    // Deletar
    static delete(id) {
        return db.prepare(`DELETE FROM dispositivos WHERE id = ?`).run(id);
    }

    // Contar total
    static count() {
        return db.prepare(`SELECT COUNT(*) as total FROM dispositivos`).get().total;
    }

    // Contar por status
    static countByStatus() {
        return db.prepare(`
            SELECT status, COUNT(*) as total 
            FROM dispositivos 
            GROUP BY status
        `).all();
    }

    // Gerar código único de rastreamento (12 caracteres)
    static gerarCodigoUnico() {
        return 'DEV-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
}

module.exports = Dispositivo;
