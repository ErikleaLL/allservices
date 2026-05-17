const db = require('../src/config/database');
const bcrypt = require('bcryptjs');

console.log('🔧 Inicializando banco de dados...');

// ==========================================
// TABELA DE USUÁRIOS
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL,
        role TEXT DEFAULT 'cliente',
        ativo INTEGER DEFAULT 1,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// ==========================================
// TABELA DE CLIENTES
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS clientes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        cpf_cnpj TEXT,
        endereco TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
`);

// ==========================================
// TABELA DE FORNECEDORES
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS fornecedores (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT,
        telefone TEXT,
        cnpj TEXT,
        endereco TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// ==========================================
// TABELA DE CATEGORIAS
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// ==========================================
// TABELA DE PEÇAS
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS pecas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        categoria_id INTEGER,
        fornecedor_id INTEGER,
        preco_custo REAL,
        preco_venda REAL,
        quantidade INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 5,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoria_id) REFERENCES categorias(id),
        FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id)
    )
`);

// ==========================================
// TABELA DE DISPOSITIVOS
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS dispositivos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        tipo TEXT,
        marca TEXT,
        modelo TEXT,
        numero_serie TEXT,
        problema_relato TEXT,
        status TEXT DEFAULT 'entrada',
        qr_code TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
`);

// ==========================================
// TABELA DE ORDENS DE SERVIÇO
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS ordens_servico (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispositivo_id INTEGER,
        tecnico_id INTEGER,
        descricao_servico TEXT,
        pecas_usadas TEXT,
        valor_mao_obra REAL,
        valor_pecas REAL,
        valor_total REAL,
        status TEXT DEFAULT 'aberto',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        concluido_em DATETIME,
        FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id),
        FOREIGN KEY (tecnico_id) REFERENCES usuarios(id)
    )
`);

// ==========================================
// TABELA FINANCEIRA
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS financeiro (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT,
        descricao TEXT,
        valor REAL,
        categoria TEXT,
        data_vencimento DATE,
        data_pagamento DATE,
        status TEXT DEFAULT 'pendente',
        ordem_servico_id INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico(id)
    )
`);

// ==========================================
// TABELA DE VENDAS
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS vendas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER,
        valor_total REAL,
        forma_pagamento TEXT,
        status TEXT DEFAULT 'concluida',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    )
`);

// ==========================================
// TABELA DE ITENS DA VENDA
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS itens_venda (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        venda_id INTEGER,
        peca_id INTEGER,
        quantidade INTEGER,
        valor_unitario REAL,
        valor_total REAL,
        FOREIGN KEY (venda_id) REFERENCES vendas(id),
        FOREIGN KEY (peca_id) REFERENCES pecas(id)
    )
`);

// ==========================================
// TABELA DE MOVIMENTAÇÕES DE ESTOQUE
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        peca_id INTEGER,
        tipo TEXT,
        quantidade INTEGER,
        motivo TEXT,
        usuario_id INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (peca_id) REFERENCES pecas(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
`);

// ==========================================
// TABELA DE HISTÓRICO DO DISPOSITIVO
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS historico_dispositivo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        dispositivo_id INTEGER,
        status_anterior TEXT,
        status_novo TEXT,
        observacao TEXT,
        usuario_id INTEGER,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id),
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
`);

// ==========================================
// TABELA DE LEADS (Captura de Interessados)
// ==========================================
db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        email TEXT NOT NULL,
        whatsapp TEXT,
        empresa TEXT,
        interesse TEXT,
        mensagem TEXT,
        origem TEXT DEFAULT 'site',
        status TEXT DEFAULT 'novo',
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
        atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

console.log('✅ Tabelas criadas com sucesso!');

// ==========================================
// SEED DO ADMIN
// ==========================================
const adminExists = db.prepare('SELECT id FROM usuarios WHERE email = ?').get('admin@admin.com');

if (!adminExists) {
    const hashedPassword = bcrypt.hashSync('123456', 10);
    
    db.prepare(`
        INSERT INTO usuarios (nome, email, senha, role)
        VALUES (?, ?, ?, ?)
    `).run('Administrador', 'admin@admin.com', hashedPassword, 'admin');
    
    console.log('✅ Usuário admin criado: admin@admin.com / 123456');
} else {
    console.log('ℹ️  Admin já existe no banco.');
}

console.log('🎉 Banco de dados inicializado com sucesso!');

db.close();
