const MarcaRoupa = require('../models/MarcaRoupa');

// Criar uma marca de roupa
const create = async (req, res, next) => {
  try {
    const marca = await MarcaRoupa.create(req.body);
    res.status(201).json(marca);
  } catch (error) {
    next(error);
  }
};

// Listar todas as marcas
const findAll = async (req, res, next) => {
  try {
    const marcas = await MarcaRoupa.find().sort({ createdAt: -1 });
    res.json(marcas);
  } catch (error) {
    next(error);
  }
};

// Buscar marca por ID
const findById = async (req, res, next) => {
  try {
    const marca = await MarcaRoupa.findById(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: 'Marca de roupa não encontrada' });
    }
    res.json(marca);
  } catch (error) {
    next(error);
  }
};

// Atualizar marca
const update = async (req, res, next) => {
  try {
    const marca = await MarcaRoupa.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!marca) {
      return res.status(404).json({ error: 'Marca de roupa não encontrada' });
    }
    res.json(marca);
  } catch (error) {
    next(error);
  }
};

// Remover marca
const remove = async (req, res, next) => {
  try {
    const marca = await MarcaRoupa.findByIdAndDelete(req.params.id);
    if (!marca) {
      return res.status(404).json({ error: 'Marca de roupa não encontrada' });
    }
    res.json({ message: 'Marca de roupa removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, findAll, findById, update, remove };
