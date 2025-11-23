// External Libraries
const express = require("express");

// Controllers
const { MovieController } = require("../controllers");

// Utils
const db = require("../dataBase");
const { movieValidator } = require("../utils/validators");

// Constants
const router = express.Router();
const movieController = new MovieController(db);

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Lista todos os filmes
 *     description: Retorna todos os filmes ativos (sem deleted_at).
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "b7e9a8f4-8e9b-4e91-8a12-3c2a2d8a6e9b"
 *                   titulo:
 *                     type: string
 *                     example: "O Senhor dos Anéis: A Sociedade do Anel"
 *                   sinopse:
 *                     type: string
 *                     example: "Um jovem hobbit embarca em uma jornada para destruir um anel poderoso."
 *                   genero:
 *                     type: string
 *                     example: "Fantasia"
 *                   duracao_min:
 *                     type: integer
 *                     example: 178
 *                   lancamento:
 *                     type: string
 *                     format: date
 *                     example: "2001-12-19"
 *                   nota_media:
 *                     type: number
 *                     format: float
 *                     example: 9.2
 *                   em_cartaz:
 *                     type: boolean
 *                     example: false
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-01T12:00:00Z"
 *                   updated_at:
 *                     type: string
 *                     format: date-time
 *                     example: "2024-05-05T09:30:00Z"
 *       500:
 *         description: Erro ao buscar filmes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro ao buscar filmes"
 */

router.get("/", movieController.getAllMovies.bind(movieController));

/**
 * @swagger
 * /movies/{id}:
 *   get:
 *     summary: Retorna um filme específico
 *     description: Busca um filme no banco de dados pelo seu ID.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do filme a ser retornado
 *     responses:
 *       200:
 *         description: Filme encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 titulo:
 *                   type: string
 *                   example: "O Poderoso Chefão"
 *                 genero:
 *                   type: string
 *                   example: "Drama"
 *                 duracao_min:
 *                   type: integer
 *                   example: 175
 *                 lancamento:
 *                   type: string
 *                   format: date
 *                   example: "1972-03-24"
 *                 em_cartaz:
 *                   type: boolean
 *                   example: false
 *       400:
 *         description: Parâmetro ID é obrigatório
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "id é obrigatório"
 *       404:
 *         description: Filme não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Filme não encontrado"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Erro no servidor"
 */

router.get("/:id", movieController.getMovieById.bind(movieController));

/**
 * @swagger
 * /movies/{id}:
 *   delete:
 *     summary: Remove um filme específico
 *     description: Marca o filme como deletado (soft delete) e remove suas relações com atores.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID (UUID) do filme a ser removido
 *     responses:
 *       200:
 *         description: Filme removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Filme e relações removidos com sucesso
 *                 movie:
 *                   type: object
 *                   description: Dados do filme removido
 *       400:
 *         description: ID não fornecido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Id é obrigatório
 *       404:
 *         description: Filme não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Filme não encontrado
 *       500:
 *         description: Erro interno no servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Erro ao remover filme
 */

router.delete("/:id", movieController.deleteMovie.bind(movieController));

/**
 * @swagger
 * /movies:
 *   post:
 *     summary: Cria um novo filme
 *     description: Adiciona um novo filme ao banco de dados.
 *     tags: [Movies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titulo
 *               - genero
 *               - duracao_min
 *               - lancamento
 *               - em_cartaz
 *             properties:
 *               titulo:
 *                 type: string
 *                 example: "O Poderoso Chefão"
 *               genero:
 *                 type: string
 *                 example: "Drama"
 *               duracao_min:
 *                 type: integer
 *                 example: 175
 *               lancamento:
 *                 type: string
 *                 format: date
 *                 example: "1972-03-24"
 *               em_cartaz:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Filme criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Filme criado com sucesso
 *                 filme:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "c12a34b5-d678-90ef-1234-56789abcde01"
 *                     titulo:
 *                       type: string
 *                       example: "O Poderoso Chefão"
 *                     genero:
 *                       type: string
 *                       example: "Drama"
 *                     duracao_min:
 *                       type: integer
 *                       example: 175
 *                     lancamento:
 *                       type: string
 *                       format: date
 *                       example: "1972-03-24"
 *                     em_cartaz:
 *                       type: boolean
 *                       example: false
 *       400:
 *         description: Campos obrigatórios ausentes ou inválidos
 *       500:
 *         description: Erro no servidor ao criar filme
 */

router.post(
  "/",
  movieValidator.createMovieValidator,
  movieController.createMovie.bind(movieController)
);

/**
 * @swagger
 * /movies/{id}:
 *   put:
 *     summary: Atualiza um filme existente
 *     description: Atualiza os dados de um filme pelo ID. Nenhum campo é obrigatório.
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do filme a ser atualizado
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titulo:
 *                 type: string
 *               sinopse:
 *                 type: string
 *               genero:
 *                 type: string
 *               duracao_min:
 *                 type: integer
 *               lancamento:
 *                 type: string
 *                 format: date
 *               em_cartaz:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso
 *       400:
 *         description: Requisição inválida
 *       404:
 *         description: Filme não encontrado
 *       500:
 *         description: Erro no servidor
 */
router.put(
  "/:id",
  movieValidator.updateMovieValidator,
  movieController.updateMovie.bind(movieController)
);

module.exports = router;
