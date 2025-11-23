function updateReviewValidator(req, res, next) {
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
      case "filme_id":
      case "nome_avaliador":
      case "comentario":
        if (typeof value !== "string" || value.trim() === "") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;

      case "nota":
        if (!Number.isInteger(value) || value < 0 || value > 10) {
          errors.push(
            `O campo "${field}" deve ser um número inteiro entre 0 e 10.`
          );
        }
        break;

      case "recomendado":
        if (typeof value !== "boolean") {
          errors.push(`O campo "${field}" deve ser true ou false.`);
        }
        break;

      default:
        break;
    }
  }

  return errors;
}

module.exports = { updateReviewValidator };
