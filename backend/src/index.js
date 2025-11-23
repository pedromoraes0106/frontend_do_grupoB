const express = require("express");
const cors = require("cors");
const { swaggerUi, specs } = require("./swagger");
const routes = require("./routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCss: ".swagger-ui .topbar { display: none }",
  })
);

app.use("/", routes);

if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${port}`);

    console.log(`📘 Documentação: http://localhost:${port}/api-docs`);
  });
}

module.exports = app;
