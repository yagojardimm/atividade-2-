const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const motoController = require('../controllers/motoController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

const validateMoto = [
  body('marca').trim().notEmpty().withMessage('A marca é obrigatória'),
  body('modelo').trim().notEmpty().withMessage('O modelo é obrigatório'),
  body('ano')
    .isInt({ min: 1885, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação inválido'),
  body('cilindrada').optional().isInt({ min: 0 }).withMessage('A cilindrada não pode ser negativa'),
  body('preco').optional().isFloat({ min: 0 }).withMessage('O preço não pode ser negativo'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    next();
  },
];

const validateMotoUpdate = [
  body('marca').optional().trim().notEmpty().withMessage('A marca não pode ser vazia'),
  body('modelo').optional().trim().notEmpty().withMessage('O modelo não pode ser vazio'),
  body('ano')
    .optional()
    .isInt({ min: 1885, max: new Date().getFullYear() + 1 })
    .withMessage('Ano de fabricação inválido'),
  body('cilindrada').optional().isInt({ min: 0 }).withMessage('A cilindrada não pode ser negativa'),
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
 *   name: Motos
 *   description: CRUD de motos (MongoDB)
 */

/**
 * @swagger
 * /api/motos:
 *   get:
 *     summary: Listar todas as motos
 *     tags: [Motos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de motos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Moto'
 *       401:
 *         description: Não autenticado
 */
router.get('/', authenticate, motoController.findAll);

/**
 * @swagger
 * /api/motos/{id}:
 *   get:
 *     summary: Buscar moto por ID
 *     tags: [Motos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da moto (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Dados da moto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Moto'
 *       404:
 *         description: Moto não encontrada
 */
router.get('/:id', authenticate, motoController.findById);

/**
 * @swagger
 * /api/motos:
 *   post:
 *     summary: Criar uma nova moto
 *     tags: [Motos]
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
 *                 example: Honda
 *               modelo:
 *                 type: string
 *                 example: CB 500
 *               ano:
 *                 type: integer
 *                 example: 2024
 *               cilindrada:
 *                 type: integer
 *                 example: 500
 *               preco:
 *                 type: number
 *                 example: 35000
 *     responses:
 *       201:
 *         description: Moto criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticate, validateMoto, motoController.create);

/**
 * @swagger
 * /api/motos/{id}:
 *   put:
 *     summary: Atualizar moto
 *     tags: [Motos]
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
 *               cilindrada:
 *                 type: integer
 *               preco:
 *                 type: number
 *     responses:
 *       200:
 *         description: Moto atualizada
 *       404:
 *         description: Moto não encontrada
 */
router.put('/:id', authenticate, validateMotoUpdate, motoController.update);

/**
 * @swagger
 * /api/motos/{id}:
 *   delete:
 *     summary: Remover moto
 *     tags: [Motos]
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
 *         description: Moto removida com sucesso
 *       404:
 *         description: Moto não encontrada
 */
router.delete('/:id', authenticate, motoController.remove);

module.exports = router;
