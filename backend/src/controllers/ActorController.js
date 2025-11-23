const message = require("../utils/constants");

class ActorController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query(
        "SELECT * FROM atores WHERE deleted_at IS NULL"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;

      if (!id) return res.status(400).json({ message: "ID é obrigatório" });

      const result = await this.db.query(
        "SELECT * FROM atores WHERE id=$1 AND deleted_at IS NULL",
        [id]
      );

      if (!result.rows.length)
        return res.status(404).json({ message: "Ator não encontrado" });

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: message.messages.actor.errors.default });
    }
  }

  async create(req, res) {
    try {
      const { nome, nascimento, biografia, nacionalidade } = req.body;

      if (!nome) return res.status(400).json({ message: "Nome é obrigatório" });

      const result = await this.db.query(
        `INSERT INTO atores (nome, nascimento, biografia, nacionalidade)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [nome, nascimento, biografia, nacionalidade]
      );

      res.status(201).json({ message: "Ator criado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: message.messages.actor.errors.default });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedActor = req.body;

      if (!Object.keys(updatedActor).length)
        return res
          .status(400)
          .json({ message: "Nenhum campo enviado para atualização." });

      const setClause = Object.keys(updatedActor)
        .map((field, i) => `${field} = $${i + 1}`)
        .join(", ");

      const values = Object.values(updatedActor);

      const result = await this.db.query(
        `UPDATE atores SET ${setClause} WHERE id=$${
          values.length + 1
        } RETURNING *`,
        [...values, id]
      );

      if (!result.rows.length)
        return res.status(404).json({ message: "Ator não encontrado" });

      res.status(200).json({ message: "Ator atualizado com sucesso" });
    } catch (error) {
      res.status(500).json({ message: message.messages.actor.errors.default });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ message: "ID é obrigatório" });

      const result = await this.db.query(
        "UPDATE atores SET deleted_at = NOW() WHERE id=$1 RETURNING *",
        [id]
      );

      if (!result.rows.length)
        return res.status(404).json({ message: "Ator não encontrado" });

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: message.messages.actor.errors.default });
    }
  }
}

module.exports = ActorController;
