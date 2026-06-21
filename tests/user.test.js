require('dotenv').config();

const request = require('supertest');
const app = require('../src/app');
const {
  connectDatabases,
  clearMongo,
  clearPostgres,
  disconnectDatabases,
} = require('./setup');

describe('Usuários — /api/users', () => {
  let adminToken;
  let userToken;
  let adminId;
  let userId;

  beforeAll(async () => {
    await connectDatabases();
  });

  beforeEach(async () => {
    await clearMongo();
    await clearPostgres();

    // Criar usuário admin e obter token
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'Admin', email: 'admin@teste.com', senha: 'admin123', role: 'admin' });
    adminId = adminRes.body.user.id;

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@teste.com', senha: 'admin123' });
    adminToken = adminLogin.body.token;

    // Criar usuário comum e obter token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({ nome: 'User', email: 'user@teste.com', senha: 'user123' });
    userId = userRes.body.user.id;

    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@teste.com', senha: 'user123' });
    userToken = userLogin.body.token;
  });

  afterAll(async () => {
    await disconnectDatabases();
  });

  // ===== LISTAR TODOS =====

  describe('GET /api/users', () => {
    it('deve listar todos os usuários (admin)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(2);
      // Não deve retornar senhas
      res.body.forEach((user) => {
        expect(user).not.toHaveProperty('senha');
      });
    });

    it('deve negar acesso a usuário não-admin', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve negar acesso sem token', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });

  // ===== BUSCAR POR ID =====

  describe('GET /api/users/:id', () => {
    it('deve buscar um usuário por ID', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('User');
      expect(res.body).not.toHaveProperty('senha');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .get('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('deve negar acesso a perfil de outro usuário para não-admin (BOLA)', async () => {
      const res = await request(app)
        .get(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('visualizar seu próprio perfil');
    });

    it('deve permitir que admin busque qualquer usuário por ID', async () => {
      const res = await request(app)
        .get(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.nome).toBe('User');
    });
  });

  // ===== ATUALIZAR =====

  describe('PUT /api/users/:id', () => {
    it('deve atualizar dados do usuário', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nome: 'Nome Atualizado' });

      expect(res.status).toBe(200);
      expect(res.body.user.nome).toBe('Nome Atualizado');
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .put('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nome: 'Teste' });

      expect(res.status).toBe(404);
    });

    it('deve negar atualização de perfil de outro usuário para não-admin (BOLA)', async () => {
      const res = await request(app)
        .put(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ nome: 'Nome Invasor' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('atualizar sua própria conta');
    });

    it('deve negar escalação de privilégio (role: admin) para não-admin', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ role: 'admin' });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Apenas administradores podem alterar o papel');
    });

    it('deve permitir que admin atualize qualquer usuário e mude o papel', async () => {
      const res = await request(app)
        .put(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ nome: 'Nome por Admin', role: 'admin' });

      expect(res.status).toBe(200);
      expect(res.body.user.nome).toBe('Nome por Admin');
      expect(res.body.user.role).toBe('admin');
    });
  });

  // ===== REMOVER =====

  describe('DELETE /api/users/:id', () => {
    it('deve remover um usuário (admin)', async () => {
      const res = await request(app)
        .delete(`/api/users/${userId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toContain('removido');
    });

    it('deve negar remoção para não-admin', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('deve retornar 404 para ID inexistente', async () => {
      const res = await request(app)
        .delete('/api/users/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });

    it('deve impedir que o admin exclua a si mesmo', async () => {
      const res = await request(app)
        .delete(`/api/users/${adminId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Você não pode excluir a sua própria conta');
    });
  });

  // ===== SEGURANÇA =====

  describe('Segurança', () => {
    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', 'Bearer token_invalido_123');

      expect(res.status).toBe(401);
    });

    it('deve rejeitar requisição sem header Authorization', async () => {
      const res = await request(app).get('/api/users');
      expect(res.status).toBe(401);
    });
  });
});
