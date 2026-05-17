const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');

const sessionConfig = require('./src/config/session');
const { errorHandler } = require('./src/middlewares/errorMiddleware');

const app = express();

// Configurações básicas
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'src/views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);

// Middlewares globais
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// Sessão
app.use(sessionConfig);

// Rotas principais
app.use('/', require('./src/routes'));

// Middleware de erro
app.use(errorHandler);

module.exports = app;
