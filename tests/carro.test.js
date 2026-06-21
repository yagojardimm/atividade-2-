require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const {
  connectDatabases,
  clearMongo,
  clearPostgres,
  disconnectDatabases,
} = require('./setup');

describe('Carros — /api/carros', () => {
  let token;
  let carroId;

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

  describe('POST /api/carros', () => {
    it('deve criar um carro com sucesso', async () => {
      const res = await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({
          marca: 'Toyota',
          modelo: 'Corolla',
          ano: 2024,
          cor: 'Prata',
          preco: 150000,
        });

      expect(res.status).toBe(201);
      expect(res.body.marca).toBe('Toyota');
      expect(res.body.modelo).toBe('Corolla');
      expect(res.body).toHaveProperty('_id');
      carroId = res.body._id;
    });

    it('deve rejeitar carro sem campos obrigatórios', async () => {
      const res = await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ cor: 'Azul' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/carros')
        .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2024 });

      expect(res.status).toBe(401);
    });
  });

  // ===== LISTAR TODOS =====

  describe('GET /api/carros', () => {
    it('deve listar todos os carros', async () => {
      // Criar dois carros
      await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2024 });

      await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Honda', modelo: 'Civic', ano: 2023 });

      const res = await request(app)
        .get('/api/carros')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('deve retornar array vazio quando não há carros', async () => {
      const res = await request(app)
        .get('/api/carros')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app).get('/api/carros');
      expect(res.status).toBe(401);
    });
  });

  // ===== BUSCAR POR ID =====

  describe('GET /api/carros/:id', () => {
    it('deve buscar um carro por ID', async () => {
      const createRes = await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2024, preco: 150000 });

      const res = await request(app)
        .get(`/api/carros/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.marca).toBe('Toyota');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/carros/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== ATUALIZAR =====

  describe('PUT /api/carros/:id', () => {
    it('deve atualizar um carro', async () => {
      const createRes = await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2024, preco: 150000 });

      const res = await request(app)
        .put(`/api/carros/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: 145000, cor: 'Preto' });

      expect(res.status).toBe(200);
      expect(res.body.preco).toBe(145000);
      expect(res.body.cor).toBe('Preto');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/carros/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`)
        .send({ preco: 100000 });

      expect(res.status).toBe(404);
    });
  });

  // ===== REMOVER =====

  describe('DELETE /api/carros/:id', () => {
    it('deve remover um carro', async () => {
      const createRes = await request(app)
        .post('/api/carros')
        .set('Authorization', `Bearer ${token}`)
        .send({ marca: 'Toyota', modelo: 'Corolla', ano: 2024 });

      const res = await request(app)
        .delete(`/api/carros/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removido');

      // Verificar que foi removido
      const getRes = await request(app)
        .get(`/api/carros/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/api/carros/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
