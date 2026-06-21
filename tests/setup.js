// Garante o uso de banco de dados de teste e previne poluição de dados
if (process.env.NODE_ENV === 'test') {
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('_test')) {
    process.env.MONGODB_URI = process.env.MONGODB_URI.split('?')[0] + '_test';
  }
  if (process.env.POSTGRES_URI && !process.env.POSTGRES_URI.endsWith('_test')) {
    process.env.POSTGRES_URI = process.env.POSTGRES_URI + '_test';
  }
}

const mongoose = require('mongoose');
const { sequelize } = require('../src/config/postgres');
const User = require('../src/models/User');
const { hashPassword } = require('../src/utils/hash');
const { Client } = require('pg');

// garante que o banco de teste postgres existe
const ensurePostgresTestDbExists = async () => {
  const uri = process.env.POSTGRES_URI;
  if (!uri) return;

  const lastSlashIndex = uri.lastIndexOf('/');
  const baseUri = uri.substring(0, lastSlashIndex + 1) + 'postgres';
  const dbName = uri.substring(lastSlashIndex + 1).split('?')[0];

  const client = new Client({ connectionString: baseUri });
  try {
    await client.connect();
    const res = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Banco de dados de teste '${dbName}' criado.`);
    }
  } catch (error) {
    console.error(`Erro ao garantir existencia do banco de teste Postgres:`, error.message);
  } finally {
    await client.end();
  }
};

// conecta nos bancos de dados
const connectDatabases = async () => {
  await ensurePostgresTestDbExists();

  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI);
  }

  await sequelize.authenticate();
  await sequelize.sync({ force: true });
};

// limpa colecoes do mongo
const clearMongo = async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

// limpa tabelas do postgres
const clearPostgres = async () => {
  await sequelize.sync({ force: true });
};

// cria admin de teste
const createTestAdmin = async () => {
  const hashedPassword = await hashPassword('admin123');
  const admin = await User.create({
    nome: 'Admin Teste',
    email: 'admin@teste.com',
    senha: hashedPassword,
    role: 'admin',
  });
  return admin;
};

// cria user de teste
const createTestUser = async () => {
  const hashedPassword = await hashPassword('user123');
  const user = await User.create({
    nome: 'Usuário Teste',
    email: 'user@teste.com',
    senha: hashedPassword,
    role: 'user',
  });
  return user;
};

// desconecta
const disconnectDatabases = async () => {
  await mongoose.connection.close();
  await sequelize.close();
};

module.exports = {
  connectDatabases,
  clearMongo,
  clearPostgres,
  createTestAdmin,
  createTestUser,
  disconnectDatabases,
};
