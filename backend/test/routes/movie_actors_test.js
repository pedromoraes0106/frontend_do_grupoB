import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

let actorId;
let movieId;

const newActor = {
  nome: "Keanu Reeves",
  nascimento: "1964-09-02",
  biografia: "Lenda absoluta.",
  nacionalidade: "Canadense",
};

const newMovie = {
  titulo: "Matrix",
  genero: "Ficção Científica",
  duracao_min: 136,
  lancamento: "1999-03-31",
  em_cartaz: false,
};

const updatedRelation = {
  papel: "Coadjuvante",
  ordem_credito: 2,
};

describe("🎬 Rotas de Relações Filme-Ator (/movie-actors)", () => {
  before((done) => {
    request
      .execute(uri)
      .post("/actors")
      .send(newActor)
      .end((err, res) => {
        expect(res).to.have.status(201);

        request
          .execute(uri)
          .get("/actors")
          .end((err2, res2) => {
            expect(res2).to.have.status(200);
            expect(res2.body).to.be.an("array").that.is.not.empty;

            const lastActor = res2.body[res2.body.length - 1];
            expect(lastActor).to.have.property("id");
            actorId = lastActor.id;

            request
              .execute(uri)
              .post("/movies")
              .send(newMovie)
              .end((err3, res3) => {
                expect(res3).to.have.status(201);

                const filme = res3.body.filme || res3.body;
                expect(filme).to.have.property("id");
                movieId = filme.id;

                expect(actorId).to.exist;
                expect(movieId).to.exist;

                done();
              });
          });
      });
  });

  describe("POST /movie-actors - Criar relação", () => {
    it("Deve criar uma nova relação filme-ator (201)", (done) => {
      const payload = {
        filme_id: movieId,
        ator_id: actorId,
        papel: "Protagonista",
        ordem_credito: 1,
      };

      request
        .execute(uri)
        .post("/movie-actors")
        .send(payload)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");

          const relation = res.body.relation || res.body;

          expect(relation).to.have.property("filme_id").that.equals(movieId);
          expect(relation).to.have.property("ator_id").that.equals(actorId);

          done();
        });
    });

    it("Deve retornar 400 se IDs obrigatórios estiverem ausentes", (done) => {
      const invalidRelation = { papel: "Figurante" };

      request
        .execute(uri)
        .post("/movie-actors")
        .send(invalidRelation)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  describe("GET /movie-actors - Listar todas as relações", () => {
    it("Deve retornar status 200 e uma lista de relações contendo a criada", (done) => {
      request
        .execute(uri)
        .get("/movie-actors")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");

          const found = res.body.some(
            (r) => r.filme_id === movieId && r.ator_id === actorId
          );
          expect(found).to.be.true;

          done();
        });
    });
  });

  describe("GET /movie-actors/movie/:filme_id - Listar atores de um filme", () => {
    it("Deve retornar status 200 e lista de atores", (done) => {
      request
        .execute(uri)
        .get(`/movie-actors/movie/${movieId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
  });

  describe("GET /movie-actors/actor/:ator_id - Listar filmes de um ator", () => {
    it("Deve retornar status 200 e lista de filmes", (done) => {
      request
        .execute(uri)
        .get(`/movie-actors/actor/${actorId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          done();
        });
    });
  });

  describe("PUT /movie-actors/:filme_id/:ator_id - Atualizar relação", () => {
    it("Deve retornar 200 ao atualizar a relação", (done) => {
      request
        .execute(uri)
        .put(`/movie-actors/${movieId}/${actorId}`)
        .send(updatedRelation)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");

          const relation = res.body.relation || res.body;

          if (relation.papel) {
            expect(relation.papel).to.equal(updatedRelation.papel);
          }

          done();
        });
    });

    it("Deve retornar 404 se a relação não existir", (done) => {
      const fakeMovie = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      const fakeActor = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request
        .execute(uri)
        .put(`/movie-actors/${fakeMovie}/${fakeActor}`)
        .send(updatedRelation)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("DELETE /movie-actors/:filme_id/:ator_id - Remover relação", () => {
    it("Deve retornar 204 ao remover a relação", (done) => {
      request
        .execute(uri)
        .delete(`/movie-actors/${movieId}/${actorId}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("Deve retornar 404 se tentar remover relação inexistente", (done) => {
      const fakeMovie = "cccccccc-cccc-cccc-cccc-cccccccccccc";
      const fakeActor = "dddddddd-dddd-dddd-dddd-dddddddddddd";

      request
        .execute(uri)
        .delete(`/movie-actors/${fakeMovie}/${fakeActor}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
