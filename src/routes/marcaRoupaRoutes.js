const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const marcaRoupaController = require('../controllers/marcaRoupaController');
const { authenticate } = require('../middlewares/auth');

const router = Router();

const validateMarcaRoupa = [
  body('nome').trim().notEmpty().withMessage('O nome da marca é obrigatório'),
  body('paisOrigem').optional().trim(),
  body('anoFundacao')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Ano de fundação inválido'),
  body('segmento')
    .optional()
    .trim()
    .isIn(['luxo', 'casual', 'esportivo', 'streetwear', 'fast-fashion', 'outro'])
    .withMessage('Segmento inválido. Use: luxo, casual, esportivo, streetwear, fast-fashion ou outro'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Dados inválidos', details: errors.array() });
    }
    next();
  },
];

const validateMarcaRoupaUpdate = [
  body('nome').optional().trim().notEmpty().withMessage('O nome não pode ser vazio'),
  body('paisOrigem').optional().trim(),
  body('anoFundacao')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Ano de fundação inválido'),
  body('segmento')
    .optional()
    .trim()
    .isIn(['luxo', 'casual', 'esportivo', 'streetwear', 'fast-fashion', 'outro'])
    .withMessage('Segmento inválido. Use: luxo, casual, esportivo, streetwear, fast-fashion ou outro'),
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
 *   name: Marcas de Roupa
 *   description: CRUD de marcas de roupa (MongoDB)
 */

/**
 * @swagger
 * /api/marcas-roupa:
 *   get:
 *     summary: Listar todas as marcas de roupa
 *     tags: [Marcas de Roupa]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de marcas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/MarcaRoupa'
 *       401:
 *         description: Não autenticado
 */
router.get('/', authenticate, marcaRoupaController.findAll);

/**
 * @swagger
 * /api/marcas-roupa/{id}:
 *   get:
 *     summary: Buscar marca de roupa por ID
 *     tags: [Marcas de Roupa]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da marca (MongoDB ObjectId)
 *     responses:
 *       200:
 *         description: Dados da marca
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarcaRoupa'
 *       404:
 *         description: Marca não encontrada
 */
router.get('/:id', authenticate, marcaRoupaController.findById);

/**
 * @swagger
 * /api/marcas-roupa:
 *   post:
 *     summary: Criar uma nova marca de roupa
 *     tags: [Marcas de Roupa]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nome
 *             properties:
 *               nome:
 *                 type: string
 *                 example: Nike
 *               paisOrigem:
 *                 type: string
 *                 example: Estados Unidos
 *               anoFundacao:
 *                 type: integer
 *                 example: 1964
 *               segmento:
 *                 type: string
 *                 enum: [luxo, casual, esportivo, streetwear, fast-fashion, outro]
 *                 example: esportivo
 *     responses:
 *       201:
 *         description: Marca criada com sucesso
 *       400:
 *         description: Dados inválidos
 */
router.post('/', authenticate, validateMarcaRoupa, marcaRoupaController.create);

/**
 * @swagger
 * /api/marcas-roupa/{id}:
 *   put:
 *     summary: Atualizar marca de roupa
 *     tags: [Marcas de Roupa]
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
 *               nome:
 *                 type: string
 *               paisOrigem:
 *                 type: string
 *               anoFundacao:
 *                 type: integer
 *               segmento:
 *                 type: string
 *                 enum: [luxo, casual, esportivo, streetwear, fast-fashion, outro]
 *     responses:
 *       200:
 *         description: Marca atualizada
 *       404:
 *         description: Marca não encontrada
 */
router.put('/:id', authenticate, validateMarcaRoupaUpdate, marcaRoupaController.update);

/**
 * @swagger
 * /api/marcas-roupa/{id}:
 *   delete:
 *     summary: Remover marca de roupa
 *     tags: [Marcas de Roupa]
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
 *         description: Marca removida com sucesso
 *       404:
 *         description: Marca não encontrada
 */
router.delete('/:id', authenticate, marcaRoupaController.remove);

module.exports = router;
