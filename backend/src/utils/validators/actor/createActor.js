const REQUIRED_FIELDS = ["nome"];

function createActorValidator(req, res, next) {
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
      case "nome":
      case "nacionalidade":
        if (typeof value !== "string" || value.trim() === "") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;
      case "nascimento":
        if (value && isNaN(Date.parse(value))) {
          errors.push(
            `O campo "${field}" deve ser uma data válida (YYYY-MM-DD).`
          );
        }
        break;
      case "biografia":
        if (value && typeof value !== "string") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;
      default:
        break;
    }
  }

  return errors;
}

module.exports = { createActorValidator };
