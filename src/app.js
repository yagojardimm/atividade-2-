const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const { globalLimiter } = require('./middlewares/rateLimiter');
const errorHandler = require('./middlewares/errorHandler');

// Rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const carroRoutes = require('./routes/carroRoutes');
const motoRoutes = require('./routes/motoRoutes');
const marcaRoupaRoutes = require('./routes/marcaRoupaRoutes');

const app = express();

// Middlewares de seguranca e utilitarios
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(globalLimiter);
app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());

// Trust proxy
app.set('trust proxy', 1);

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Dual Database — Documentação',
}));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/carros', carroRoutes);
app.use('/api/motos', motoRoutes);
app.use('/api/marcas-roupa', marcaRoupaRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'API Dual Database — Node.js + Express',
    documentacao: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      carros: '/api/carros',
      motos: '/api/motos',
      marcasRoupa: '/api/marcas-roupa',
    },
  });
});

// Handler global de erros
app.use(errorHandler);

module.exports = app;
