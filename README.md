# API Dual Database — Node.js + Express

API REST com dois contextos de persistência: MongoDB (NoSQL) e PostgreSQL (SQL relacional).

## Recursos

| Recurso | Banco | Endpoints |
|---------|-------|-----------|
| Carro | MongoDB | `/api/carros` |
| Moto | MongoDB | `/api/motos` |
| Marca de Roupa | MongoDB | `/api/marcas-roupa` |
| Usuário | PostgreSQL | `/api/users` |
| Autenticação | PostgreSQL | `/api/auth` |

## Pré-requisitos

- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) instalados

## Como Executar

### 1. Clonar o repositório
```bash
git clone <url-do-repositorio>
cd <pasta-do-projeto>
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```
Edite o arquivo `.env` conforme necessário. As configurações padrão funcionam para desenvolvimento local.

### 3. Subir os containers
```bash
docker-compose up --build
```

### 4. Acessar a aplicação
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api-docs

## Usuário Admin Padrão

Ao iniciar pela primeira vez, um usuário admin é criado automaticamente:
- **Email**: `admin@email.com`
- **Senha**: `admin123`

## Endpoints da API

### Autenticação
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| POST | `/api/auth/register` | Registrar usuário | ❌ Pública |
| POST | `/api/auth/login` | Login (retorna JWT) | ❌ Pública |

### Usuários (PostgreSQL)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/users` | Listar todos | 🔒 Admin |
| GET | `/api/users/:id` | Buscar por ID | 🔒 JWT |
| PUT | `/api/users/:id` | Atualizar | 🔒 JWT |
| DELETE | `/api/users/:id` | Remover | 🔒 Admin |

### Carros (MongoDB)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/carros` | Listar todos | 🔒 JWT |
| GET | `/api/carros/:id` | Buscar por ID | 🔒 JWT |
| POST | `/api/carros` | Criar | 🔒 JWT |
| PUT | `/api/carros/:id` | Atualizar | 🔒 JWT |
| DELETE | `/api/carros/:id` | Remover | 🔒 JWT |

### Motos (MongoDB)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/motos` | Listar todas | 🔒 JWT |
| GET | `/api/motos/:id` | Buscar por ID | 🔒 JWT |
| POST | `/api/motos` | Criar | 🔒 JWT |
| PUT | `/api/motos/:id` | Atualizar | 🔒 JWT |
| DELETE | `/api/motos/:id` | Remover | 🔒 JWT |

### Marcas de Roupa (MongoDB)
| Método | Rota | Descrição | Autenticação |
|--------|------|-----------|--------------|
| GET | `/api/marcas-roupa` | Listar todas | 🔒 JWT |
| GET | `/api/marcas-roupa/:id` | Buscar por ID | 🔒 JWT |
| POST | `/api/marcas-roupa` | Criar | 🔒 JWT |
| PUT | `/api/marcas-roupa/:id` | Atualizar | 🔒 JWT |
| DELETE | `/api/marcas-roupa/:id` | Remover | 🔒 JWT |

## Executar Testes

Os testes de integração podem ser executados via Docker:

```bash
docker-compose --profile test run --rm tests
```

Ou localmente (com bancos de dados disponíveis):
```bash
npm install
npm test
```

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `PORT` | Porta da API | `3000` |
| `NODE_ENV` | Ambiente | `development` |
| `JWT_SECRET` | Chave secreta do JWT | — |
| `JWT_EXPIRES_IN` | Tempo de expiração do token | `24h` |
| `MONGODB_URI` | URI de conexão MongoDB | — |
| `POSTGRES_URI` | URI de conexão PostgreSQL | — |
| `MONGO_INITDB_ROOT_USERNAME` | Usuário root do MongoDB | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | Senha root do MongoDB | — |
| `POSTGRES_USER` | Usuário PostgreSQL | `postgres` |
| `POSTGRES_PASSWORD` | Senha PostgreSQL | — |
| `POSTGRES_DB` | Nome do banco PostgreSQL | `api_dual_db` |

## Tecnologias

- Node.js + Express
- MongoDB + Mongoose
- PostgreSQL + Sequelize
- JWT (jsonwebtoken)
- bcryptjs
- Helmet, CORS, Rate Limiting
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest + Supertest
- Docker + Docker Compose
