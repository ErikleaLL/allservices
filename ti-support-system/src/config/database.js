const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database/database.sqlite');

// Cria conexão
const db = new Database(dbPath);

// Ativa foreign keys
db.pragma('foreign_keys = ON');

console.log('📦 Banco de dados SQLite conectado com sucesso.');

module.exports = db;
