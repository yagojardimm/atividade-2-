const mongoose = require('mongoose');

const motoSchema = new mongoose.Schema(
  {
    marca: {
      type: String,
      required: [true, 'A marca é obrigatória'],
      trim: true,
    },
    modelo: {
      type: String,
      required: [true, 'O modelo é obrigatório'],
      trim: true,
    },
    ano: {
      type: Number,
      required: [true, 'O ano é obrigatório'],
      min: [1885, 'Ano mínimo: 1885'],
      max: [new Date().getFullYear() + 1, 'Ano inválido'],
    },
    cilindrada: {
      type: Number,
      min: [0, 'A cilindrada não pode ser negativa'],
    },
    preco: {
      type: Number,
      min: [0, 'O preço não pode ser negativo'],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Moto', motoSchema);
