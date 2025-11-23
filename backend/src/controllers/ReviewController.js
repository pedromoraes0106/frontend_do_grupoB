const message = require("../utils/constants");

class ReviewController {
  constructor(db) {
    this.db = db;
  }

  async getAll(req, res) {
    try {
      const result = await this.db.query(
        "SELECT * FROM avaliacoes WHERE deleted_at IS NULL"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getOne(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res
          .status(400)
          .json({ message: message.messages.review.errors.ERRORS.missingId });
      }

      const result = await this.db.query(
        "SELECT * FROM avaliacoes WHERE id=$1 AND deleted_at IS NULL",
        [id]
      );

      if (!result.rows.length) {
        return res
          .status(404)
          .json({ message: message.messages.review.errors.ERRORS.not_Found });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res
        .status(500)
        .json({ message: message.messages.review.errors.ERRORS.default });
    }
  }
  async createReview(req, res) {
    try {
      const { filme_id, nome_avaliador, nota, comentario, recomendado } =
        req.body;

      const filme = await this.db.query(`SELECT id FROM filmes WHERE id = $1`, [
        filme_id,
      ]);

      if (filme.rowCount === 0) {
        return res.status(404).json({ message: "Filme não encontrado" });
      }

      await this.db.query(
        `INSERT INTO avaliacoes (filme_id, nome_avaliador, nota, comentario, recomendado)
       VALUES ($1, $2, $3, $4, $5)`,
        [filme_id, nome_avaliador, nota, comentario, recomendado ?? false]
      );

      res.status(201).json({ message: "Review criada com sucesso" });
    } catch (error) {
      res.status(500).json({
        message: "Erro ao criar review",
        error: error.message,
      });
    }
  }

  async updateReview(req, res) {
    try {
      const { id } = req.params;
      const { nome_avaliador, nota, comentario, recomendado } = req.body;

      if (!id) {
        return res
          .status(400)
          .json({ message: message.messages.review.errors.ERRORS.missingId });
      }

      if (!Object.keys(req.body).length) {
        return res
          .status(400)
          .json({ message: "Nenhum campo enviado para atualização." });
      }

      const check = await this.db.query(
        "SELECT * FROM avaliacoes WHERE id=$1 AND deleted_at IS NULL",
        [id]
      );

      if (!check.rows.length) {
        return res
          .status(404)
          .json({ message: message.messages.review.errors.ERRORS.not_Found });
      }

      const fields = [];
      const values = [];
      let index = 1;

      if (nome_avaliador !== undefined) {
        fields.push(`nome_avaliador = $${index++}`);
        values.push(nome_avaliador);
      }
      if (nota !== undefined) {
        fields.push(`nota = $${index++}`);
        values.push(nota);
      }
      if (comentario !== undefined) {
        fields.push(`comentario = $${index++}`);
        values.push(comentario);
      }
      if (recomendado !== undefined) {
        fields.push(`recomendado = $${index++}`);
        values.push(recomendado);
      }

      if (!fields.length) {
        return res
          .status(400)
          .json({ message: "Nenhum campo válido para atualização." });
      }

      values.push(id);

      const result = await this.db.query(
        `UPDATE avaliacoes SET ${fields.join(
          ", "
        )} WHERE id=$${index} RETURNING *`,
        values
      );

      res.status(200).json({ message: "Review atualizada com sucesso" });
    } catch (error) {
      res.status(500).json({
        message: message.messages.review.errors.ERRORS.default,
        error: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id)
        return res
          .status(400)
          .json({ message: message.messages.review.errors.ERRORS.missingId });

      await this.db.transaction(async (client) => {
        const check = await client.query(
          "SELECT * FROM avaliacoes WHERE id = $1 AND deleted_at IS NULL",
          [id]
        );

        if (!check.rows.length) {
          throw {
            status: 404,
            message: message.messages.review.errors.ERRORS.not_Found,
          };
        }

        await client.query(
          "UPDATE avaliacoes SET deleted_at = NOW() WHERE id = $1",
          [id]
        );

        res.status(204).send();
      });
    } catch (error) {
      res.status(error.status || 500).json({
        message: error.message || message.messages.review.errors.ERRORS.default,
      });
    }
  }
}

module.exports = ReviewController;
