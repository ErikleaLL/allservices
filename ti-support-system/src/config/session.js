const session = require('express-session');
const SQLiteStore = require('better-sqlite3-session-store')(session);

const path = require('path');

const dbPath = path.join(__dirname, '../../database/database.sqlite');

module.exports = session({
    store: new SQLiteStore({
        client: require('better-sqlite3')(dbPath),
    }),
    secret: process.env.SESSION_SECRET || 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // mudar para true se usar HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8 // 8 horas
    }
});
