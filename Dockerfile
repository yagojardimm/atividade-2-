FROM node:20-alpine

WORKDIR /app

# Copiar arquivos de dependência primeiro (melhor cache de build)
COPY package*.json ./

# Instalar somente dependências de produção
RUN npm ci --only=production

# Copiar o código-fonte
COPY src/ ./src/

# Expor porta da API
EXPOSE 3000

# Executar a aplicação
CMD ["node", "src/server.js"]
