const express = require("express");
const router = express.Router();
const { ActorController } = require("../controllers");

const { actorValidator } = require("../utils/validators");

const db = require("../dataBase");

const actorController = new ActorController(db);

/**
 * @swagger
 * /actors:
 *   get:
 *     summary: Lista todos os atores
 *     tags: [Atores]
 *     responses:
 *       200:
 *         description: Lista de atores retornada com sucesso
 */
router.get("/", actorController.getAll.bind(actorController));

/**
 * @swagger
 * /actors/{id}:
 *   get:
 *     summary: Retorna um ator específico
 *     tags: [Atores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Ator encontrado
 *       404:
 *         description: Ator não encontrado
 */
router.get("/:id", actorController.getOne.bind(actorController));

/**
 * @swagger
 * /actors:
 *   post:
 *     summary: Cria um novo ator
 *     tags: [Atores]
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
 *                 example: "Leonardo DiCaprio"
 *               nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1974-11-11"
 *               biografia:
 *                 type: string
 *                 example: "Ator americano famoso por Titanic."
 *               nacionalidade:
 *                 type: string
 *                 example: "Americano"
 *     responses:
 *       201:
 *         description: Ator criado com sucesso
 *       400:
 *         description: Campos obrigatórios ausentes ou inválidos
 *       500:
 *         description: Erro no servidor ao criar ator
 */
router.post(
  "/",
  actorValidator.createActorValidator,
  actorController.create.bind(actorController)
);

/**
 * @swagger
 * /actors/{id}:
 *   put:
 *     summary: Atualiza um ator existente
 *     tags: [Atores]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               nome:
 *                 type: string
 *                 example: "Leonardo DiCaprio"
 *               nascimento:
 *                 type: string
 *                 format: date
 *                 example: "1974-11-11"
 *               biografia:
 *                 type: string
 *                 example: "Ator americano famoso por Titanic."
 *               nacionalidade:
 *                 type: string
 *                 example: "Americano"
 *     responses:
 *       200:
 *         description: Ator atualizado com sucesso
 *       400:
 *         description: Nenhum campo enviado ou inválido
 *       404:
 *         description: Ator não encontrado
 *       500:
 *         description: Erro no servidor ao atualizar ator
 */
router.put(
  "/:id",
  actorValidator.updateActorValidator,
  actorController.update.bind(actorController)
);

/**
 * @swagger
 * /actors/{id}:
 *   delete:
 *     summary: Remove um ator específico
 *     tags: [Atores]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Ator removido com sucesso
 *       404:
 *         description: Ator não encontrado
 */
router.delete("/:id", actorController.delete.bind(actorController));

module.exports = router;
