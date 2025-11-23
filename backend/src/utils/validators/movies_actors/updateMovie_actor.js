const REQUIRED_FIELDS = ["filme_id", "ator_id"];

function updateMovieActorValidator(req, res, next) {
  const body = req.body;
  const errors = checkErrors(body);

  if (!errors.length && Object.keys(body).length) return next();

  if (!Object.keys(body).length) {
    return res
      .status(400)
      .json({ message: "Nenhum campo enviado para atualização" });
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
      case "papel":
        if (value && typeof value !== "string") {
          errors.push(`O campo "${field}" deve ser um texto válido.`);
        }
        break;
      case "ordem_credito":
        if (value && (!Number.isInteger(value) || value < 1)) {
          errors.push(
            `O campo "${field}" deve ser um número inteiro positivo.`
          );
        }
        break;
    }
  }

  return errors;
}

module.exports = { updateMovieActorValidator };
