function updateActorValidator(req, res, next) {
  const body = req.body;

  if (!Object.keys(body).length) {
    return res
      .status(400)
      .json({ message: "Nenhum campo enviado para atualização." });
  }

  const errors = checkErrors(body);

  if (errors.length > 0) {
    return res.status(400).json({
      message: `Erros de validação encontrados: ${errors.length} erro(s)`,
      errors,
    });
  }

  next();
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

module.exports = { updateActorValidator };
