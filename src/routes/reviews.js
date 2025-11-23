// External Libraries
const express = require("express");

// Controllers
const { ReviewController } = require("../controllers");

// Utils
const { reviewValidator } = require("../utils/validators");
const db = require("../dataBase");

const router = express.Router();
const reviewController = new ReviewController(db);

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Lista todas as reviews
 *     description: Retorna todas as avaliações ativas (sem deleted_at)
 *     tags: [Reviews]
 *     responses:
 *       200:
 *         description: Lista de reviews retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   comentario:
 *                     type: string
 *                     example: "Ótimo filme!"
 *                   nota:
 *                     type: number
 *                     example: 9
 *       500:
 *         description: Erro ao buscar reviews
 */
router.get("/", reviewController.getAll.bind(reviewController));

/**
 * @swagger
 * /reviews/{id}:
 *   get:
 *     summary: Retorna uma review específica
 *     description: Busca uma avaliação pelo ID
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review
 *     responses:
 *       200:
 *         description: Review encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 comentario:
 *                   type: string
 *                   example: "Ótimo filme!"
 *                 nota:
 *                   type: number
 *                   example: 9
 *       404:
 *         description: Review não encontrada
 *       500:
 *         description: Erro ao buscar review
 */
router.get("/:id", reviewController.getOne.bind(reviewController));

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Remove uma review específica
 *     description: Marca a review como deletada (soft delete)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID da review a ser removida
 *     responses:
 *       204:
 *         description: Review removida com sucesso
 *       400:
 *         description: ID não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ID é obrigatório"
 *       404:
 *         description: Review não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review não encontrada"
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao remover review"
 */
router.delete("/:id", reviewController.delete.bind(reviewController));

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Cria uma nova review
 *     description: Adiciona uma avaliação para um filme no banco de dados.
 *     tags: [Reviews]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filme_id
 *               - nome_avaliador
 *               - nota
 *             properties:
 *               filme_id:
 *                 type: string
 *                 format: uuid
 *                 example: "c12a34b5-d678-90ef-1234-56789abcde01"
 *               nome_avaliador:
 *                 type: string
 *                 example: "Lucas Sigoli"
 *               nota:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 9
 *               comentario:
 *                 type: string
 *                 example: "Filme excelente, recomendo!"
 *               recomendado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Review criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review criada com sucesso"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "a1b2c3d4-e5f6-7890-1234-56789abcdef0"
 *                     filme_id:
 *                       type: string
 *                       format: uuid
 *                     nome_avaliador:
 *                       type: string
 *                     nota:
 *                       type: integer
 *                     comentario:
 *                       type: string
 *                     recomendado:
 *                       type: boolean
 *                     criado_em:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Campos obrigatórios ausentes ou inválidos
 *       500:
 *         description: Erro no servidor ao criar review
 */
router.post(
  "/",
  reviewValidator.createReviewValidator,
  reviewController.createReview.bind(reviewController)
);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Atualiza uma review existente
 *     description: Atualiza os dados de uma avaliação pelo ID. Nenhum campo é obrigatório.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da review a ser atualizada
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome_avaliador:
 *                 type: string
 *                 example: "Lucas Sigoli"
 *               nota:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 8
 *               comentario:
 *                 type: string
 *                 example: "Alterei minha avaliação, mas continua excelente!"
 *               recomendado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Review atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Review atualizada com sucesso"
 *                 review:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     filme_id:
 *                       type: string
 *                       format: uuid
 *                     nome_avaliador:
 *                       type: string
 *                     nota:
 *                       type: integer
 *                     comentario:
 *                       type: string
 *                     recomendado:
 *                       type: boolean
 *                     criado_em:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Nenhum campo enviado ou campos inválidos
 *       404:
 *         description: Review não encontrada
 *       500:
 *         description: Erro no servidor ao atualizar review
 */
router.put(
  "/:id",
  reviewValidator.updateReviewValidator,
  reviewController.updateReview.bind(reviewController)
);

module.exports = router;
