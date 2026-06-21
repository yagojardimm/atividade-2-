const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Dual Database — Carros, Motos, Marcas de Roupa e Usuários',
      version: '1.0.0',
      description:
        'API REST com Node.js e Express utilizando MongoDB (NoSQL) para recursos de Carro, Moto e Marca de Roupa, e PostgreSQL (SQL relacional) para gerenciamento de Usuários. Autenticação via JWT.',
      contact: {
        name: 'Suporte',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Insira o token JWT obtido no login',
        },
      },
      schemas: {
        Carro: {
          type: 'object',
          required: ['marca', 'modelo', 'ano'],
          properties: {
            _id: { type: 'string', description: 'ID gerado pelo MongoDB' },
            marca: { type: 'string', description: 'Marca do carro', example: 'Toyota' },
            modelo: { type: 'string', description: 'Modelo do carro', example: 'Corolla' },
            ano: { type: 'integer', description: 'Ano de fabricação', example: 2024 },
            cor: { type: 'string', description: 'Cor do veículo', example: 'Prata' },
            preco: { type: 'number', description: 'Preço em reais', example: 150000.00 },
          },
        },
        Moto: {
          type: 'object',
          required: ['marca', 'modelo', 'ano'],
          properties: {
            _id: { type: 'string', description: 'ID gerado pelo MongoDB' },
            marca: { type: 'string', description: 'Marca da moto', example: 'Honda' },
            modelo: { type: 'string', description: 'Modelo da moto', example: 'CB 500' },
            ano: { type: 'integer', description: 'Ano de fabricação', example: 2024 },
            cilindrada: { type: 'integer', description: 'Cilindrada em cc', example: 500 },
            preco: { type: 'number', description: 'Preço em reais', example: 35000.00 },
          },
        },
        MarcaRoupa: {
          type: 'object',
          required: ['nome'],
          properties: {
            _id: { type: 'string', description: 'ID gerado pelo MongoDB' },
            nome: { type: 'string', description: 'Nome da marca', example: 'Nike' },
            paisOrigem: { type: 'string', description: 'País de origem', example: 'Estados Unidos' },
            anoFundacao: { type: 'integer', description: 'Ano de fundação', example: 1964 },
            segmento: { type: 'string', description: 'Segmento (luxo, casual, esportivo)', example: 'esportivo' },
          },
        },
        User: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            id: { type: 'integer', description: 'ID auto-incrementado' },
            nome: { type: 'string', description: 'Nome do usuário', example: 'João Silva' },
            email: { type: 'string', format: 'email', description: 'Email único', example: 'joao@email.com' },
            role: { type: 'string', enum: ['admin', 'user'], description: 'Papel do usuário', example: 'user' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: { type: 'string', format: 'email', example: 'admin@email.com' },
            senha: { type: 'string', example: 'senha123' },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['nome', 'email', 'senha'],
          properties: {
            nome: { type: 'string', example: 'João Silva' },
            email: { type: 'string', format: 'email', example: 'joao@email.com' },
            senha: { type: 'string', minLength: 6, example: 'senha123' },
            role: { type: 'string', enum: ['admin', 'user'], example: 'user' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', description: 'Mensagem de erro' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
