const Carro = require('../models/Carro');

// Criar um carro
const create = async (req, res, next) => {
  try {
    const carro = await Carro.create(req.body);
    res.status(201).json(carro);
  } catch (error) {
    next(error);
  }
};

// Listar todos os carros
const findAll = async (req, res, next) => {
  try {
    const carros = await Carro.find().sort({ createdAt: -1 });
    res.json(carros);
  } catch (error) {
    next(error);
  }
};

// Buscar carro por ID
const findById = async (req, res, next) => {
  try {
    const carro = await Carro.findById(req.params.id);
    if (!carro) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    res.json(carro);
  } catch (error) {
    next(error);
  }
};

// Atualizar carro
const update = async (req, res, next) => {
  try {
    const carro = await Carro.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!carro) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    res.json(carro);
  } catch (error) {
    next(error);
  }
};

// Remover carro
const remove = async (req, res, next) => {
  try {
    const carro = await Carro.findByIdAndDelete(req.params.id);
    if (!carro) {
      return res.status(404).json({ error: 'Carro não encontrado' });
    }
    res.json({ message: 'Carro removido com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, findAll, findById, update, remove };
