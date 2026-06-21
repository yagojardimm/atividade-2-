require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const {
  connectDatabases,
  clearMongo,
  clearPostgres,
  disconnectDatabases,
} = require('./setup');

describe('Autenticação — /api/auth', () => {
  beforeAll(async () => {
    await connectDatabases();
  });

  beforeEach(async () => {
    await clearMongo();
    await clearPostgres();
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  // ===== REGISTRO =====

  describe('POST /api/auth/register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'João Silva',
          email: 'joao@email.com',
          senha: 'senha123',
        });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Usuário criado com sucesso');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.email).toBe('joao@email.com');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user).not.toHaveProperty('senha');
    });

    it('deve registrar um usuário admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          nome: 'Admin',
          email: 'admin@email.com',
          senha: 'admin123',
          role: 'admin',
        });

      expect(res.status).toBe(201);
      expect(res.body.user.role).toBe('admin');
    });

    it('deve rejeitar registro com email duplicado', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ nome: 'User 1', email: 'duplicado@email.com', senha: 'senha123' });

      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'User 2', email: 'duplicado@email.com', senha: 'senha456' });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('já está cadastrado');
    });

    it('deve rejeitar registro sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: '' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar registro com email inválido', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Test', email: 'invalido', senha: 'senha123' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar registro com senha curta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Test', email: 'test@email.com', senha: '123' });

      expect(res.status).toBe(400);
    });
  });

  // ===== LOGIN =====

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ nome: 'Test User', email: 'test@email.com', senha: 'senha123' });
    });

    it('deve fazer login com credenciais corretas', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@email.com', senha: 'senha123' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Login realizado com sucesso');
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.email).toBe('test@email.com');
    });

    it('deve rejeitar login com senha incorreta', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@email.com', senha: 'errada' });

      expect(res.status).toBe(401);
      expect(res.body.error).toContain('Credenciais inválidas');
    });

    it('deve rejeitar login com email inexistente', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'naoexiste@email.com', senha: 'senha123' });

      expect(res.status).toBe(401);
    });

    it('deve rejeitar login sem email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ senha: 'senha123' });

      expect(res.status).toBe(400);
    });
  });
});
