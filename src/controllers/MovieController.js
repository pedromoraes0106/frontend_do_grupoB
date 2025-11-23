class MovieController {
  constructor(db) {
    this.db = db;
  }

  async getAllMovies(req, res) {
    try {
      const result = await this.db.query(
        "SELECT * FROM filmes WHERE deleted_at IS NULL"
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async getMovieById(req, res) {
    try {
      const { id } = req.params;

      if (!id) return res.status(400).json({ message: "id é obrigatório" });

      const result = await this.db.query(
        "SELECT * FROM filmes WHERE id=$1 AND deleted_at IS NULL",
        [id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Filme não encontrado" });
      }

      res.status(200).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async deleteMovie(req, res) {
    const { id } = req.params;

    if (!id) return res.status(400).json({ message: "Id é obrigatório" });

    try {
      await this.db.transaction(async (client) => {
        const check = await client.query(
          "SELECT * FROM filmes WHERE id = $1 AND deleted_at IS NULL",
          [id]
        );

        if (!check.rows.length) {
          throw { status: 404, message: "Filme não encontrado" };
        }

        await client.query("DELETE FROM filmes_atores WHERE filme_id = $1", [
          id,
        ]);

        const result = await client.query(
          "UPDATE filmes SET deleted_at = NOW() WHERE id = $1 RETURNING *",
          [id]
        );

        res.status(204).send();
      });
    } catch (error) {
      res
        .status(error.status || 500)
        .json({ message: error.message || "Erro ao remover filme" });
    }
  }

  async createMovie(req, res) {
    try {
      const { titulo, genero, duracao_min, lancamento, em_cartaz } = req.body;

      const result = await this.db.query(
        `INSERT INTO filmes (titulo, genero, duracao_min, lancamento, em_cartaz)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
        [titulo, genero, duracao_min, lancamento, em_cartaz]
      );

      res.status(201).json({
        message: "Filme criado com sucesso",
        filme: result.rows[0],
      });
    } catch (error) {
      res.status(500).json({ message: error.message || "Erro ao criar filme" });
    }
  }

  async updateMovie(req, res) {
    try {
      const { id } = req.params;
      const updatedMovie = req.body;

      const setClause = Object.keys(updatedMovie)
        .map((field, i) => `${field} = $${i + 1}`)
        .join(", ");

      const values = Object.values(updatedMovie);

      const result = await this.db.query(
        `UPDATE filmes
           SET ${setClause}, updated_at = NOW()
           WHERE id = $${values.length + 1}
           RETURNING *`,
        [...values, id]
      );

      if (!result.rows.length) {
        return res.status(404).json({ message: "Recurso não enontrado" });
      }

      return res
        .status(200)
        .json({ message: "Recurso atualizado com sucesso" });
    } catch (error) {
      res
        .status(500)
        .json({ message: error.message || "Erro ao atualizar filme" });
    }
  }
}

module.exports = MovieController;
