require('dotenv').config();

const app = require('./app');
const connectMongo = require('./config/mongo');
const { connectPostgres } = require('./config/postgres');
const User = require('./models/User');
const { hashPassword } = require('./utils/hash');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectMongo();
    await connectPostgres();

    // seed admin se nao existir
    const adminExists = await User.findOne({ where: { email: 'admin@email.com' } });
    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      await User.create({
        nome: 'Administrador',
        email: 'admin@email.com',
        senha: hashedPassword,
        role: 'admin',
      });
      console.log('Admin padrao criado: admin@email.com / admin123');
    }

    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
      console.log(`Docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
};

startServer();
