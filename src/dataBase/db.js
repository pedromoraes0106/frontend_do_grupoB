const { Pool } = require("pg");

const pool = new Pool({
  user: "usuario",
  host: "database",
  database: "bancodados",
  password: "senha",
  port: 5432,
});

const query = (text, params) => pool.query(text, params);

async function transaction(operar) {
  const conexao = await pool.connect();
  try {
    await conexao.query("BEGIN");

    const result = await operar(conexao);

    await conexao.query("COMMIT");

    return result;
  } catch (err) {
    await conexao.query("ROLLBACK");

    throw err;
  } finally {
    conexao.release();
  }
}

module.exports = { query, transaction };
