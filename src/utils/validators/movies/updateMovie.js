function updateMovieValidator(req, res, next) {
  const body = req.body;

  if (!Object.keys(body).length) {
    return res
      .status(400)
      .json({ message: "Nenhum campo enviado para atualização." });
  }

  const errors = checkUpdateErrors(body);

  if (errors.length > 0) {
    return res.status(400).json({
      message: `Erros de validação encontrados: ${errors.length} erro(s)`,
      errors,
    });
  }

  next();
}

function checkUpdateErrors(body) {
  const errors = [];

  for (const [field, value] of Object.entries(body)) {
    switch (field) {
      case "titulo":
      case "genero":
      case "sinopse":
        if (typeof value !== "string" || value.trim() === "") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;

      case "duracao_min":
        if (!Number.isInteger(value) || value <= 0) {
          errors.push(
            `O campo "${field}" deve ser um número inteiro maior que 0.`
          );
        }
        break;

      case "lancamento":
        if (isNaN(Date.parse(value))) {
          errors.push(
            `O campo "${field}" deve ser uma data válida (YYYY-MM-DD).`
          );
        }
        break;

      case "em_cartaz":
        if (typeof value !== "boolean") {
          errors.push(`O campo "${field}" deve ser um valor booleano.`);
        }
        break;

      default:
        break;
    }
  }

  return errors;
}

module.exports = { updateMovieValidator };
