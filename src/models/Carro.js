const mongoose = require('mongoose');

const carroSchema = new mongoose.Schema(
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
      min: [1886, 'Ano mínimo: 1886'],
      max: [new Date().getFullYear() + 1, 'Ano inválido'],
    },
    cor: {
      type: String,
      trim: true,
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

module.exports = mongoose.model('Carro', carroSchema);
