const Moto = require('../models/Moto');

// Criar uma moto
const create = async (req, res, next) => {
  try {
    const moto = await Moto.create(req.body);
    res.status(201).json(moto);
  } catch (error) {
    next(error);
  }
};

// Listar todas as motos
const findAll = async (req, res, next) => {
  try {
    const motos = await Moto.find().sort({ createdAt: -1 });
    res.json(motos);
  } catch (error) {
    next(error);
  }
};

// Buscar moto por ID
const findById = async (req, res, next) => {
  try {
    const moto = await Moto.findById(req.params.id);
    if (!moto) {
      return res.status(404).json({ error: 'Moto não encontrada' });
    }
    res.json(moto);
  } catch (error) {
    next(error);
  }
};

// Atualizar moto
const update = async (req, res, next) => {
  try {
    const moto = await Moto.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!moto) {
      return res.status(404).json({ error: 'Moto não encontrada' });
    }
    res.json(moto);
  } catch (error) {
    next(error);
  }
};

// Remover moto
const remove = async (req, res, next) => {
  try {
    const moto = await Moto.findByIdAndDelete(req.params.id);
    if (!moto) {
      return res.status(404).json({ error: 'Moto não encontrada' });
    }
    res.json({ message: 'Moto removida com sucesso' });
  } catch (error) {
    next(error);
  }
};

module.exports = { create, findAll, findById, update, remove };
