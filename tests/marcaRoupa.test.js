require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const {
  connectDatabases,
  clearMongo,
  clearPostgres,
  disconnectDatabases,
} = require('./setup');

describe('Marcas de Roupa — /api/marcas-roupa', () => {
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

  describe('POST /api/marcas-roupa', () => {
    it('deve criar uma marca de roupa com sucesso', async () => {
      const res = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({
          nome: 'Nike',
          paisOrigem: 'Estados Unidos',
          anoFundacao: 1964,
          segmento: 'esportivo',
        });

      expect(res.status).toBe(201);
      expect(res.body.nome).toBe('Nike');
      expect(res.body.segmento).toBe('esportivo');
      expect(res.body).toHaveProperty('_id');
    });

    it('deve rejeitar marca sem nome', async () => {
      const res = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ paisOrigem: 'Brasil' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar segmento inválido', async () => {
      const res = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Test', segmento: 'invalido' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar nome duplicado', async () => {
      await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike' });

      const res = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike' });

      expect(res.status).toBe(400);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app)
        .post('/api/marcas-roupa')
        .send({ nome: 'Nike' });

      expect(res.status).toBe(401);
    });
  });

  // ===== LISTAR TODOS =====

  describe('GET /api/marcas-roupa', () => {
    it('deve listar todas as marcas', async () => {
      await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike', segmento: 'esportivo' });

      await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Adidas', segmento: 'esportivo' });

      const res = await request(app)
        .get('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
    });

    it('deve retornar array vazio quando não há marcas', async () => {
      const res = await request(app)
        .get('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('deve rejeitar sem autenticação', async () => {
      const res = await request(app).get('/api/marcas-roupa');
      expect(res.status).toBe(401);
    });
  });

  // ===== BUSCAR POR ID =====

  describe('GET /api/marcas-roupa/:id', () => {
    it('deve buscar uma marca por ID', async () => {
      const createRes = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike', paisOrigem: 'EUA', anoFundacao: 1964, segmento: 'esportivo' });

      const res = await request(app)
        .get(`/api/marcas-roupa/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('Nike');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/marcas-roupa/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  // ===== ATUALIZAR =====

  describe('PUT /api/marcas-roupa/:id', () => {
    it('deve atualizar uma marca', async () => {
      const createRes = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike', segmento: 'esportivo' });

      const res = await request(app)
        .put(`/api/marcas-roupa/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ paisOrigem: 'Estados Unidos', anoFundacao: 1964 });

      expect(res.status).toBe(200);
      expect(res.body.paisOrigem).toBe('Estados Unidos');
      expect(res.body.anoFundacao).toBe(1964);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/marcas-roupa/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`)
        .send({ paisOrigem: 'Brasil' });

      expect(res.status).toBe(404);
    });
  });

  // ===== REMOVER =====

  describe('DELETE /api/marcas-roupa/:id', () => {
    it('deve remover uma marca', async () => {
      const createRes = await request(app)
        .post('/api/marcas-roupa')
        .set('Authorization', `Bearer ${token}`)
        .send({ nome: 'Nike' });

      const res = await request(app)
        .delete(`/api/marcas-roupa/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removid');

      // Verificar que foi removida
      const getRes = await request(app)
        .get(`/api/marcas-roupa/${createRes.body._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(404);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/api/marcas-roupa/64f1234567890abcdef12345')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});
