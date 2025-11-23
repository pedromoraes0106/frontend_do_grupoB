const message = require("../utils/constants");

class MovieActorController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query("SELECT * FROM filmes_atores");
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async getByMovie(req, res) {
    try {
      const { filme_id } = req.params;
      if (!filme_id) {
        return res
          .status(400)
          .json({ message: message.messages.actor.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        `
        SELECT a.id, a.nome, a.nascimento, a.biografia, a.nacionalidade, fa.papel, fa.ordem_credito
        FROM filmes_atores fa
        JOIN atores a ON fa.ator_id = a.id
        WHERE fa.filme_id = $1
        ORDER BY fa.ordem_credito ASC
        `,
        [filme_id]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async getByActor(req, res) {
    try {
      const { ator_id } = req.params;

      if (!ator_id) {
        return res
          .status(400)
          .json({ message: message.messages.actor.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        `
        SELECT f.id, f.titulo, f.lancamento, f.genero, fa.papel, fa.ordem_credito
        FROM filmes_atores fa
        JOIN filmes f ON fa.filme_id = f.id
        WHERE fa.ator_id = $1
        ORDER BY fa.ordem_credito ASC
        `,
        [ator_id]
      );

      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const { filme_id, ator_id, papel, ordem_credito } = req.body;
      if (!filme_id || !ator_id) {
        return res
          .status(400)
          .json({ message: message.messages.actor.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        `
        INSERT INTO filmes_atores (filme_id, ator_id, papel, ordem_credito)
        VALUES ($1, $2, $3, $4)
        RETURNING *
        `,
        [filme_id, ator_id, papel || null, ordem_credito || null]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const { filme_id, ator_id } = req.params;
      const { papel, ordem_credito } = req.body;

      if (!filme_id || !ator_id) {
        return res
          .status(400)
          .json({ message: message.messages.actor.errors.ERRORS.missingId });
      }

      const fields = [];
      const values = [];
      let i = 1;

      if (papel !== undefined) {
        fields.push(`papel = $${i++}`);
        values.push(papel);
      }
      if (ordem_credito !== undefined) {
        fields.push(`ordem_credito = $${i++}`);
        values.push(ordem_credito);
      }

      if (!fields.length) {
        return res.status(400).json({ message: "Nenhum campo enviado" });
      }

      values.push(filme_id, ator_id);

      const result = await this.db.query(
        `
        UPDATE filmes_atores
        SET ${fields.join(", ")}
        WHERE filme_id = $${i++} AND ator_id = $${i}
        RETURNING *
        `,
        values
      );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({ message: message.messages.actor.errors.ERRORS.not_Found });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { filme_id, ator_id } = req.params;

      if (!filme_id || !ator_id) {
        return res
          .status(400)
          .json({ message: message.messages.actor.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        "DELETE FROM filmes_atores WHERE filme_id = $1 AND ator_id = $2 RETURNING *",
        [filme_id, ator_id]
      );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({ message: message.messages.actor.errors.ERRORS.not_Found });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({
        message: message.messages.actor.errors.ERRORS.default,
        error: error.message,
      });
    }
  }
}

module.exports = MovieActorController;
