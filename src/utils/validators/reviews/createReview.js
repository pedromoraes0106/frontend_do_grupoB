const REQUIRED_FIELDS = ["filme_id", "nota", "nome_avaliador"];

function createReviewValidator(req, res, next) {
  const body = req.body;

  const missingFields = REQUIRED_FIELDS.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === ""
  );

  const errors = checkErrors(body);

  if (!missingFields.length && !errors.length) return next();

  if (missingFields.length) {
    return res.status(400).json({
      message: `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
    });
  }

  if (errors.length) {
    return res.status(400).json({
      message: "Erros de validação encontrados",
      errors,
    });
  }
}

function checkErrors(body) {
  const errors = [];

  for (const [field, value] of Object.entries(body)) {
    switch (field) {
      case "filme_id":
        if (typeof value !== "string" || value.trim() === "") {
          errors.push(`O campo "${field}" deve ser um UUID válido.`);
        }
        break;

      case "nota":
        if (!Number.isInteger(value) || value < 0 || value > 10) {
          errors.push(
            `O campo "${field}" deve ser um número inteiro entre 0 e 10.`
          );
        }
        break;

      case "nome_avaliador":
        if (typeof value !== "string" || value.trim() === "") {
          errors.push(
            `O campo "${field}" é obrigatório e deve ser um texto válido.`
          );
        }
        break;

      case "comentario":
        if (value !== undefined && typeof value !== "string") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;

      case "recomendado":
        if (value !== undefined && typeof value !== "boolean") {
          errors.push(`O campo "${field}" deve ser true ou false.`);
        }
        break;

      default:
        break;
    }
  }

  return errors;
}

module.exports = { createReviewValidator };
