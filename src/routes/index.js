const express = require("express");
const router = express.Router();

const movies = require("./movies");
const actors = require("./actors");
const reviews = require("./reviews");
const movieActors = require("./movie_actor");

router.use("/movies", movies);
router.use("/actors", actors);
router.use("/reviews", reviews);
router.use("/movie-actors", movieActors);

router.get("/", (req, res) => {
  res.send("🎬 API rodando com sucesso!");
});

module.exports = router;
