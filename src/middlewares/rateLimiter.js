const rateLimit = require('express-rate-limit');

// limiter global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Muitas requisições. Tente novamente em 15 minutos.',
  },
});

// limiter para login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
  },
});

module.exports = { globalLimiter, loginLimiter };
