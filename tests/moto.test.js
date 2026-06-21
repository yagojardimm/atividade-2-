require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const {
  connectDatabases,
  clearMongo,
  clearPostgres,
  disconnectDatabases,
} = require('./setup');

describe('Motos — /api/motos', () => {
  let token;

  beforeAll(async () => {
    await connectDatabases();
  });

  beforeEach(async () => {
    await clearMongo();
    await clearPostgres();

    // Criar usuário e obter token
    await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Test', email: 'test@email.com', senha: 'senha123' });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@email.com', senha: 'senha123' });
    token = loginRes.body.token;
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  // ===== CRIAR =====

  describe('POST /api/motos', () => {
    it('deve criar uma moto com sucesso', async () => {
      const res = await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({
          marca: 'Honda',
          modelo: 'CB 500',
          ano: 2024,
          cilindrada: 500,
          preco: 35000,
        });

      expect(res.status).toBe(201);
      expect(res.body.marca).toBe('Honda');
      expect(res.body.modelo).toBe('CB 500');
      expect(res.body.cilindrada).toBe(500);
      expect(res.body).toHaveProperty('_id');
    });

    it('deve rejeitar moto sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ cilindrada: 600 });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/motos')
        .send({ marca: 'Honda', modelo: 'CB 500', ano: 2024 });

      expect(res.status).toBe(401);
    });
  });

  // ===== LISTAR TODOS =====

  describe('GET /api/motos', () => {
    it('deve listar todas as motos', async () => {
      await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Honda', modelo: 'CB 500', ano: 2024 });

      await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Yamaha', modelo: 'MT-07', ano: 2023 });

      const res = await request(app)
        .get('/api/motos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('deve retornar array vazio quando não há motos', async () => {
      const res = await request(app)
        .get('/api/motos')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app).get('/api/motos');
      expect(res.status).toBe(401);
    });
  });

  // ===== BUSCAR POR ID =====

  describe('GET /api/motos/:id', () => {
    it('deve buscar uma moto por ID', async () => {
      const createRes = await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Honda', modelo: 'CB 500', ano: 2024, cilindrada: 500 });

      const res = await request(app)
        .get(`/api/motos/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.marca).toBe('Honda');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/motos/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== ATUALIZAR =====

  describe('PUT /api/motos/:id', () => {
    it('deve atualizar uma moto', async () => {
      const createRes = await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Honda', modelo: 'CB 500', ano: 2024, preco: 35000 });

      const res = await request(app)
        .put(`/api/motos/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: 33000, cilindrada: 500 });

      expect(res.status).toBe(200);
      expect(res.body.preco).toBe(33000);
      expect(res.body.cilindrada).toBe(500);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/motos/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: 30000 });

      expect(res.status).toBe(404);
    });
  });

  // ===== REMOVER =====

  describe('DELETE /api/motos/:id', () => {
    it('deve remover uma moto', async () => {
      const createRes = await request(app)
        .post('/api/motos')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Honda', modelo: 'CB 500', ano: 2024 });

      const res = await request(app)
        .delete(`/api/motos/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removid');

      // Verificar que foi removida
      const getRes = await request(app)
        .get(`/api/motos/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/api/motos/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
