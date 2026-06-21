const mongoose = require('mongoose');

const marcaRoupaSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome da marca é obrigatório'],
      unique: true,
      trim: true,
    },
    paisOrigem: {
      type: String,
      trim: true,
    },
    anoFundacao: {
      type: Number,
      min: [1, 'Ano de fundação inválido'],
    },
    segmento: {
      type: String,
      trim: true,
      enum: {
        values: ['luxo', 'casual', 'esportivo', 'streetwear', 'fast-fashion', 'outro'],
        message: 'Segmento inválido. Use: luxo, casual, esportivo, streetwear, fast-fashion ou outro',
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('MarcaRoupa', marcaRoupaSchema);
