# Documentação do Projeto — API Dual Database

## 1. Visão Geral

Este projeto consiste em uma API REST desenvolvida com **Node.js** e **Express**, projetada para demonstrar a utilização de dois contextos distintos de persistência de dados em uma única aplicação. A API gerencia quatro recursos principais: **Carro**, **Moto**, **Marca de Roupa** e **Usuário**, cada um com operações completas de CRUD (Create, Read, Update, Delete).

## 2. Arquitetura e Tecnologias

A arquitetura segue o padrão **MVC** (Model-View-Controller), separando claramente as responsabilidades em camadas: **Models** (definição dos dados e validações), **Controllers** (lógica de negócio), **Routes** (definição dos endpoints com documentação Swagger), e **Middlewares** (autenticação, autorização, rate limiting e tratamento de erros).

### Bancos de Dados

- **MongoDB** (NoSQL via Mongoose): Utilizado para armazenar os recursos de **Carro**, **Moto** e **Marca de Roupa**. A escolha do MongoDB para esses recursos se justifica pela flexibilidade dos schemas e pela natureza dos dados, que não possuem relações complexas entre si.
- **PostgreSQL** (SQL relacional via Sequelize): Utilizado para o gerenciamento de **Usuários**, onde a integridade referencial, unicidade de email e a estrutura relacional são fundamentais para a segurança da autenticação.

### Principais Dependências

| Pacote | Função |
|--------|--------|
| `express` | Framework web para criação de rotas e middlewares |
| `mongoose` | ODM para MongoDB — modelagem de schemas e queries |
| `sequelize` + `pg` | ORM para PostgreSQL — modelagem relacional e queries parametrizadas |
| `jsonwebtoken` | Geração e verificação de tokens JWT para autenticação |
| `bcryptjs` | Hash seguro de senhas com salt (10 rounds) |
| `helmet` | Configuração de headers HTTP de segurança |
| `cors` | Controle de acesso cross-origin |
| `express-rate-limit` | Limitação de requisições para prevenção de ataques |
| `express-mongo-sanitize` | Prevenção contra injeção NoSQL |
| `express-validator` | Validação e sanitização de inputs |
| `swagger-jsdoc` + `swagger-ui-express` | Documentação automática da API com interface interativa |
| `jest` + `supertest` | Framework de testes e simulação de requisições HTTP |

## 3. Segurança — OWASP Top 10

A aplicação implementa diversas práticas de segurança alinhadas ao OWASP Top 10, com foco especial após auditoria refinada de rotas:

- **A01 — Broken Access Control (BOLA & Privilege Escalation)**: 
  - Restrição de visualização (`GET /api/users/:id`) e atualização (`PUT /api/users/:id`) de perfis. Agora, um usuário só pode acessar ou editar sua própria conta, a menos que possua o perfil de `admin`.
  - Proteção contra Mass Assignment / Privilege Escalation: Apenas administradores autenticados podem alterar privilégios (mudar o campo `role` de `user` para `admin` ou registrar novos administradores via `POST /api/auth/register`).
  - Autenticação JWT obrigatória em rotas protegidas e autorização por role (admin) para operações sensíveis como listagem total e exclusão de usuários.
- **A02 — Cryptographic Failures**: Senhas armazenadas exclusivamente como hash bcrypt com salt, nunca em texto plano. O JWT utiliza uma chave secreta configurável via variável de ambiente.
- **A03 — Injection**: Utilização de `express-mongo-sanitize` para prevenir injeção NoSQL, e validação avançada de parâmetros com `express-validator` em todas as rotas (Carros, Motos, Marcas de Roupa e Usuários) para higienizar entradas e evitar injeções. As queries do Sequelize são parametrizadas por padrão contra SQL injection.
- **A04 — Insecure Design**: Validação de dados na rota com `express-validator` e no modelo, limitação de tamanho de payload JSON (10kb), e rate limiting global e específico para rotas de autenticação contra ataques de força bruta.
- **A05 — Security Misconfiguration**: Headers de segurança configurados via Helmet, stack traces ocultos em produção, configuração via variáveis de ambiente, e isolamento completo de banco de dados de teste (sufixo `_test`) criado de forma programática automática no Postgres e no MongoDB para evitar a poluição ou limpeza acidental de dados de desenvolvimento.

## 4. Autenticação e Autorização

O fluxo de autenticação segue o padrão **Bearer Token JWT**:

1. O usuário se registra via `POST /api/auth/register` (recebendo papel `user` por padrão).
2. Realiza login via `POST /api/auth/login` e recebe um token JWT.
3. Inclui o token no header `Authorization: Bearer <token>` em todas as requisições autenticadas.
4. O middleware de autenticação verifica a validade do token e extrai os dados do usuário.
5. Rotas administrativas (`GET /api/users` e `DELETE /api/users/:id`) verificam adicionalmente se o usuário possui o role `admin`.
6. Endpoints de perfil comum aplicam validações BOLA cruzando o `req.user.id` com o ID do recurso solicitado.

## 5. Testes de Integração

Os testes foram desenvolvidos com **Jest** e **Supertest**, cobrindo todos os endpoints da aplicação:

- **auth.test.js**: Registro, login, validações de campos, credenciais inválidas.
- **user.test.js**: CRUD de usuários, permissões admin, tokens inválidos.
- **carro.test.js**: CRUD completo com autenticação, validações de campos.
- **moto.test.js**: CRUD completo com autenticação, validações de campos.
- **marcaRoupa.test.js**: CRUD completo, validação de segmento, nome duplicado.

Para executar os testes via Docker:
```bash
docker-compose --profile test run --rm tests
```

## 6. Conteinerização com Docker

A aplicação é totalmente conteinerizada com Docker Compose, orquestrando três serviços principais:

- **mongodb**: Banco NoSQL com healthcheck e volume persistente.
- **postgres**: Banco SQL com healthcheck e volume persistente.
- **api**: Aplicação Node.js que aguarda ambos os bancos estarem saudáveis antes de iniciar.

O fluxo principal de execução é via Docker:
```bash
docker-compose up --build
```

## 7. Documentação da API

A documentação interativa é gerada automaticamente via **Swagger UI** e está acessível em `http://localhost:3000/api-docs` após a inicialização do servidor. Todos os endpoints, schemas, exemplos de request/response e autenticação estão documentados.
