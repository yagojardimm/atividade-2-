const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Gera hash bcrypt de uma senha
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} Hash bcrypt
 */
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compara senha em texto plano com hash bcrypt
 * @param {string} password - Senha em texto plano
 * @param {string} hash - Hash bcrypt armazenado
 * @returns {Promise<boolean>} true se a senha corresponde
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = { hashPassword, comparePassword };
