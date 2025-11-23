const REQUIRED_FIELDS = [
  "titulo",
  "genero",
  "em_cartaz",
  "lancamento",
  "duracao_min",
];

function createMovieValidator(req, res, next) {
  const body = req.body;

  const missingFields = REQUIRED_FIELDS.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === ""
  );

  const errors = checkErros(body);

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

function checkErros(body) {
  const errors = [];

  for (const [field, value] of Object.entries(body)) {
    switch (field) {
      case "titulo":
      case "genero":
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
          errors.push(`O campo "${field}" deve ser true ou false.`);
        }
        break;

      default:
        break;
    }
  }

  return errors;
}

module.exports = { createMovieValidator };
