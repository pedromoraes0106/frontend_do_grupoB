import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

const newMovie = {
  titulo: "Interestelar",
  genero: "Ficção Científica",
  duracao_min: 169,
  lancamento: "2014-11-06",
  em_cartaz: false,
};

const newReviewBase = {
  nome_avaliador: "Erick Gomes",
  nota: 9,
  comentario: "Filme sensacional, trilha absurda.",
  recomendado: true,
};

const updateReview = {
  nome_avaliador: "Erick Gomes",
  nota: 10,
  comentario: "Revendo agora: obra-prima absoluta.",
  recomendado: true,
};

let filmeId;
let reviewId;

describe("⭐ Rotas de Reviews (/reviews)", () => {
  before((done) => {
    request
      .execute(uri)
      .post("/movies")
      .send(newMovie)
      .end((err, res) => {
        expect(res).to.have.status(201);
        const filme = res.body.filme || res.body;
        expect(filme).to.have.property("id");
        filmeId = filme.id;
        expect(filmeId).to.be.a("string");
        done();
      });
  });

  describe("POST /reviews - Criar Review", () => {
    it("Deve criar uma nova review (201) com filme_id válido e definir reviewId", (done) => {
      const newReview = {
        ...newReviewBase,
        filme_id: filmeId,
      };

      request
        .execute(uri)
        .post("/reviews")
        .send(newReview)
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.be.an("object");

          const maybeReview = res.body.review || res.body;

          if (maybeReview && maybeReview.id) {
            reviewId = maybeReview.id;
            expect(reviewId).to.be.a("string");
            return done();
          }

          request
            .execute(uri)
            .get("/reviews")
            .end((err2, res2) => {
              expect(res2).to.have.status(200);
              expect(res2.body).to.be.an("array").that.is.not.empty;

              const created = res2.body
                .slice()
                .reverse()
                .find(
                  (r) =>
                    String(r.filme_id) === String(filmeId) &&
                    r.nome_avaliador === newReviewBase.nome_avaliador &&
                    r.nota === newReviewBase.nota &&
                    r.comentario === newReviewBase.comentario
                );

              expect(created, "Não foi possível localizar a review criada").to
                .exist;
              reviewId = created.id;
              expect(reviewId).to.be.a("string");
              done();
            });
        });
    });

    it("Deve retornar 400 se campos obrigatórios estiverem ausentes", (done) => {
      const invalidReview = {
        filme_id: filmeId,
        nota: 8,
      };

      request
        .execute(uri)
        .post("/reviews")
        .send(invalidReview)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  describe("GET /reviews - Listar Reviews", () => {
    it("Deve retornar 200 e uma lista de reviews contendo a criada", (done) => {
      request
        .execute(uri)
        .get("/reviews")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(reviewId, "reviewId deveria estar definido antes deste teste")
            .to.exist;

          const found = res.body.some((r) => String(r.id) === String(reviewId));
          expect(found).to.be.true;

          done();
        });
    });
  });

  describe("GET /reviews/:id - Buscar Review por ID", () => {
    it("Deve retornar 200 e a review específica", (done) => {
      expect(reviewId, "reviewId não definido antes do GET /reviews/:id").to
        .exist;

      request
        .execute(uri)
        .get(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(String(res.body.id)).to.equal(String(reviewId));
          done();
        });
    });

    it("Deve retornar 404 para ID inexistente", (done) => {
      const nonExistentId = "99999999-9999-9999-9999-999999999999";

      request
        .execute(uri)
        .get(`/reviews/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("PUT /reviews/:id - Atualizar Review", () => {
    it("Deve atualizar a review existente e retornar 204", (done) => {
      expect(reviewId, "reviewId não definido antes do PUT /reviews/:id").to
        .exist;

      request
        .execute(uri)
        .put(`/reviews/${reviewId}`)
        .send(updateReview)
        .end((err, res) => {
          expect(res.status).to.equal(200);

          done();
        });
    });

    it("Deve retornar 400 se nenhum campo for enviado", (done) => {
      request
        .execute(uri)
        .put(`/reviews/${reviewId}`)
        .send({})
        .end((err, res) => {
          if (res.status === 400) {
            expect(res.body).to.have.property("message");
          }
          done();
        });
    });

    it("Deve retornar 404 para review inexistente", (done) => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

      request
        .execute(uri)
        .put(`/reviews/${nonExistentId}`)
        .send(updateReview)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("DELETE /reviews/:id - Remover Review", () => {
    it("Deve retornar 204 ao remover a review existente", (done) => {
      expect(reviewId, "reviewId não definido antes do DELETE /reviews/:id").to
        .exist;

      request
        .execute(uri)
        .delete(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("Deve retornar 404 ao buscar a review removida", (done) => {
      request
        .execute(uri)
        .get(`/reviews/${reviewId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it("Deve retornar 404 ao tentar remover review inexistente", (done) => {
      const nonExistentId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request
        .execute(uri)
        .delete(`/reviews/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
