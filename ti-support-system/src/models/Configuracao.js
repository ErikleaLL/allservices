const db = require('../config/database');

class Configuracao {

    // Buscar todas
    static findAll() {
        return db.prepare(`SELECT * FROM configuracoes ORDER BY chave ASC`).all();
    }

    // Buscar como objeto chave-valor
    static getAll() {
        const rows = this.findAll();
        const config = {};
        rows.forEach(r => {
            config[r.chave] = r.valor;
        });
        return config;
    }

    // Buscar uma chave específica
    static get(chave) {
        const row = db.prepare(`SELECT valor FROM configuracoes WHERE chave = ?`).get(chave);
        return row ? row.valor : null;
    }

    // Atualizar uma chave
    static set(chave, valor) {
        const existe = db.prepare(`SELECT id FROM configuracoes WHERE chave = ?`).get(chave);
        
        if (existe) {
            db.prepare(`
                UPDATE configuracoes 
                SET valor = ?, atualizado_em = CURRENT_TIMESTAMP 
                WHERE chave = ?
            `).run(valor, chave);
        } else {
            db.prepare(`
                INSERT INTO configuracoes (chave, valor) VALUES (?, ?)
            `).run(chave, valor);
        }
    }

    // Atualizar várias configs de uma vez
    static updateMany(configs) {
        Object.entries(configs).forEach(([chave, valor]) => {
            this.set(chave, valor);
        });
    }
}

module.exports = Configuracao;
