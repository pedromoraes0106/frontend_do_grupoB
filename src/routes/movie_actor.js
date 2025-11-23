const express = require("express");
const router = express.Router();
const { MovieActorController } = require("../controllers");
const db = require("../dataBase");

const { movieActorValidator } = require("../utils/validators");

const movieActorController = new MovieActorController(db);

/**
 * @swagger
 * tags:
 *   name: Filmes-Atores
 *   description: Rotas para gerenciar a relação entre filmes e atores
 */

/**
 * @swagger
 * /movie-actors:
 *   get:
 *     summary: Lista todas as relações de filmes e atores
 *     tags: [Movies-Actors]
 *     responses:
 *       200:
 *         description: Relações retornadas com sucesso
 *       500:
 *         description: Erro no servidor
 */
router.get("/", movieActorController.getAll.bind(movieActorController));

/**
 * @swagger
 * /movie-actors/movie/{filme_id}:
 *   get:
 *     summary: Lista todos os atores de um filme específico
 *     tags: [Movies-Actors]
 *     parameters:
 *       - in: path
 *         name: filme_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do filme
 *     responses:
 *       200:
 *         description: Atores retornados com sucesso
 *       400:
 *         description: ID do filme não informado
 *       500:
 *         description: Erro no servidor
 */
router.get(
  "/movie/:filme_id",
  movieActorController.getByMovie.bind(movieActorController)
);

/**
 * @swagger
 * /movie-actors/actor/{ator_id}:
 *   get:
 *     summary: Lista todos os filmes de um ator específico
 *     tags: [Movies-Actors]
 *     parameters:
 *       - in: path
 *         name: ator_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do ator
 *     responses:
 *       200:
 *         description: Filmes retornados com sucesso
 *       400:
 *         description: ID do ator não informado
 *       500:
 *         description: Erro no servidor
 */
router.get(
  "/actor/:ator_id",
  movieActorController.getByActor.bind(movieActorController)
);

/**
 * @swagger
 * /movie-actors:
 *   post:
 *     summary: Cria uma nova relação filme-ator
 *     tags: [Movies-Actors]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filme_id
 *               - ator_id
 *             properties:
 *               filme_id:
 *                 type: string
 *                 format: uuid
 *               ator_id:
 *                 type: string
 *                 format: uuid
 *               papel:
 *                 type: string
 *               ordem_credito:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Relação criada com sucesso
 *       400:
 *         description: IDs obrigatórios ausentes
 *       500:
 *         description: Erro no servidor
 */
router.post(
  "/",
  movieActorValidator.createMovieActorValidator,
  movieActorController.create.bind(movieActorController)
);

/**
 * @swagger
 * /movie-actors/{filme_id}/{ator_id}:
 *   put:
 *     summary: Atualiza uma relação filme-ator existente
 *     tags: [Movies-Actors]
 *     parameters:
 *       - in: path
 *         name: filme_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: ator_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               papel:
 *                 type: string
 *               ordem_credito:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Relação atualizada com sucesso
 *       400:
 *         description: Nenhum campo enviado
 *       404:
 *         description: Relação não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.put(
  "/:filme_id/:ator_id",
  movieActorValidator.updateMovieActorValidator,
  movieActorController.update.bind(movieActorController)
);

/**
 * @swagger
 * /movie-actors/{filme_id}/{ator_id}:
 *   delete:
 *     summary: Remove uma relação filme-ator
 *     tags: [Movies-Actors]
 *     parameters:
 *       - in: path
 *         name: filme_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: ator_id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Relação removida com sucesso
 *       404:
 *         description: Relação não encontrada
 *       500:
 *         description: Erro no servidor
 */
router.delete(
  "/:filme_id/:ator_id",
  movieActorController.delete.bind(movieActorController)
);

module.exports = router;
