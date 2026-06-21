const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log('PostgreSQL conectado');
    await sequelize.sync({ alter: true });
    console.log('Tabelas sincronizadas');
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error.message);
    throw error;
  }
};

module.exports = { sequelize, connectPostgres };
