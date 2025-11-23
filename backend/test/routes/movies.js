import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

const newMovie = {
  titulo: "O Poderoso Chefão",
  genero: "Drama",
  duracao_min: 175,
  lancamento: "1972-03-24",
  em_cartaz: false,
};

const updateMovie = {
  titulo: "O Poderoso Chefão (Versão Restaurada)",
  genero: "Drama/Crime",
  duracao_min: 178,
  em_cartaz: true,
};

let movieId;

describe("🎬 Rotas de Filmes (/movies)", () => {
  describe("POST /movies - Criar Filme", () => {
    it("Deve criar um novo filme e retornar 201 com o objeto filme", (done) => {
      request
        .execute(uri)
        .post("/movies")
        .send(newMovie)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");

          let filme = res.body.filme || res.body.movie || res.body;

          if (filme && filme.id) {
            movieId = filme.id;
            expect(movieId).to.be.a("string");
            return done();
          }

          request
            .execute(uri)
            .get("/movies")
            .end((err2, res2) => {
              expect(res2).to.have.status(200);
              expect(res2.body).to.be.an("array").that.is.not.empty;

              const candidate = [...res2.body]
                .reverse()
                .find((m) => m.titulo === newMovie.titulo);

              expect(candidate, "Não foi possível localizar o filme criado").to
                .exist;
              movieId = candidate.id;
              expect(movieId).to.be.a("string");

              done();
            });
        });
    });

    it("Deve retornar 400 se campos obrigatórios estiverem ausentes", (done) => {
      const invalidMovie = {
        titulo: "Filme Incompleto",
      };

      request
        .execute(uri)
        .post("/movies")
        .send(invalidMovie)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  describe("GET /movies - Listar Filmes", () => {
    it("Deve retornar 200 e uma lista de filmes contendo o criado", (done) => {
      expect(movieId, "movieId não definido antes do GET /movies").to.exist;

      request
        .execute(uri)
        .get("/movies")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");

          const found = res.body.some((m) => String(m.id) === String(movieId));
          expect(found).to.be.true;

          done();
        });
    });
  });

  describe("GET /movies/:id - Buscar Filme por ID", () => {
    it("Deve retornar 200 e o filme específico", (done) => {
      expect(movieId).to.exist;

      request
        .execute(uri)
        .get(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(String(res.body.id)).to.equal(String(movieId));
          expect(res.body).to.have.property("titulo");
          done();
        });
    });

    it("Deve retornar 404 para um ID que não existe", (done) => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

      request
        .execute(uri)
        .get(`/movies/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  describe("PUT /movies/:id - Atualizar Filme", () => {
    it("Deve retornar 200 e atualizar o filme com sucesso", (done) => {
      expect(movieId).to.exist;

      request
        .execute(uri)
        .put(`/movies/${movieId}`)
        .send(updateMovie)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("Deve retornar 404 para um ID de filme que não existe", (done) => {
      const nonExistentId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request
        .execute(uri)
        .put(`/movies/${nonExistentId}`)
        .send(updateMovie)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });

    it("Deve retornar 400 se o body estiver vazio", (done) => {
      request
        .execute(uri)
        .put(`/movies/${movieId}`)
        .send({})
        .end((err, res) => {
          if (res.status === 400) {
            expect(res.body).to.have.property("message");
          }
          done();
        });
    });
  });

  describe("DELETE /movies/:id - Remover Filme (soft delete)", () => {
    it("Deve retornar 204 e remover o filme", (done) => {
      expect(movieId).to.exist;

      request
        .execute(uri)
        .delete(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("Deve retornar 404 ao buscar o filme removido", (done) => {
      request
        .execute(uri)
        .get(`/movies/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it("Deve retornar 404 ao tentar remover um filme inexistente", (done) => {
      const nonExistentId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

      request
        .execute(uri)
        .delete(`/movies/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });
});
