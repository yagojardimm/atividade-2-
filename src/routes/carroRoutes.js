const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const carroController = require('../controllers/carroController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

const validateCarro = [
  body('marca').trim().notEmpty().withMessage('A marca é obrigatória'),
  body('modelo').trim().notEmpty().withMessage('O modelo é obrigatório'),
  body('ano')
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação inválido'),
  body('cor').optional().trim(),
  body('preco').optional().isFloat({ min: 0 }).withMessage('O preço não pode ser negativo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    next();
  },
];

const validateCarroUpdate = [
  body('marca').optional().trim().notEmpty().withMessage('A marca não pode ser vazia'),
  body('modelo').optional().trim().notEmpty().withMessage('O modelo não pode ser vazio'),
  body('ano')
    .optional()
    .isInt({ min: 1886, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação inválido'),
  body('cor').optional().trim(),
  body('preco').optional().isFloat({ min: 0 }).withMessage('O preço não pode ser negativo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    next();
  },
];

/**
 * @swagger
 * tags:
 *   name: Carros
 *   description: CRUD de carros (MongoDB)
 */

/**
 * @swagger
 * /api/carros:
 *   get:
 *     summary: Listar todos os carros
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carros
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Carro'
 *       401:
 *         description: Não autenticado
 */
router.get('/', authenticate, carroController.findAll);

/**
 * @swagger
 * /api/carros/{id}:
 *   get:
 *     summary: Buscar carro por ID
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID do carro (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Dados do carro
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Carro'
 *       404:
 *         description: Carro não encontrado
 */
router.get('/:id', authenticate, carroController.findById);

/**
 * @swagger
 * /api/carros:
 *   post:
 *     summary: Criar um novo carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marca
 *               - modelo
 *               - ano
 *             properties:
 *               marca:
 *                 type: string
 *                 example: Toyota
 *               modelo:
 *                 type: string
 *                 example: Corolla
 *               ano:
 *                 type: integer
 *                 example: 2024
 *               cor:
 *                 type: string
 *                 example: Prata
 *               preco:
 *                 type: number
 *                 example: 150000
 *     responses:
 *       201:
 *         description: Carro criado com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticate, validateCarro, carroController.create);

/**
 * @swagger
 * /api/carros/{id}:
 *   put:
 *     summary: Atualizar carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               ano:
 *                 type: integer
 *               cor:
 *                 type: string
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Carro atualizado
 *       404:
 *         description: Carro não encontrado
 */
router.put('/:id', authenticate, validateCarroUpdate, carroController.update);

/**
 * @swagger
 * /api/carros/{id}:
 *   delete:
 *     summary: Remover carro
 *     tags: [Carros]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Carro removido com sucesso
 *       404:
 *         description: Carro não encontrado
 */
router.delete('/:id', authenticate, carroController.remove);

module.exports = router;
