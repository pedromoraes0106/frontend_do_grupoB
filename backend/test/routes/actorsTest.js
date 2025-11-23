import * as chai from "chai";
import chaiHttp from "chai-http";
import { request } from "chai-http";

chai.use(chaiHttp);
const { expect } = chai;

const uri = "http://localhost:3000";

const newActor = {
  nome: "Margot Robbie",
  nascimento: "1990-07-02",
  biografia: "Atriz australiana, famosa por Barbie e O Lobo de Wall Street.",
  nacionalidade: "Australiana",
};

const updateActor = {
  biografia: "Atriz australiana. Vencedora de vários prêmios.",
  nacionalidade: "Australiana/Americana",
};

let actorId;

describe("🎭 Rotas de Atores (/actors)", () => {
  describe("POST /actors - Criar Ator", () => {
    it("Deve criar um novo ator e definir actorId para os próximos testes", (done) => {
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
              expect(res2.body).to.be.an("array");
              expect(res2.body.length).to.be.greaterThan(0);

              const last = res2.body[res2.body.length - 1];
              expect(last).to.have.property("id");
              actorId = last.id;

              expect(actorId, "actorId não definido após criação").to.exist;

              done();
            });
        });
    });

    it('Deve retornar status 400 se o campo "nome" estiver ausente', (done) => {
      const invalidActor = { nascimento: "2000-01-01" };
      request
        .execute(uri)
        .post("/actors")
        .send(invalidActor)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("message");
          done();
        });
    });
  });

  // --- TESTE GET /actors ---
  describe("GET /actors - Listar Atores", () => {
    it("Deve retornar status 200 e uma lista de atores contendo o ator criado", (done) => {
      request
        .execute(uri)
        .get("/actors")
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("array");
          expect(actorId, "actorId deveria estar definido antes deste teste").to
            .exist;

          const found = res.body.some((a) => String(a.id) === String(actorId));
          expect(found).to.be.true;

          done();
        });
    });
  });

  describe("GET /actors/:id - Buscar Ator por ID", () => {
    it("Deve retornar status 200 e o ator específico", (done) => {
      expect(actorId, "actorId não definido antes do GET /actors/:id").to.exist;

      request
        .execute(uri)
        .get(`/actors/${actorId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(String(res.body.id)).to.equal(String(actorId));
          done();
        });
    });

    it("Deve retornar status 404 para um ID que não existe", (done) => {
      const nonExistentId = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
      request
        .execute(uri)
        .get(`/actors/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("PUT /actors/:id - Atualizar Ator", () => {
    it("Deve retornar status 200 e atualizar o ator com sucesso", (done) => {
      expect(actorId, "actorId não definido antes do PUT /actors/:id").to.exist;

      request
        .execute(uri)
        .put(`/actors/${actorId}`)
        .send(updateActor)
        .end((err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });

    it("Deve retornar status 404 para um ID de ator que não existe", (done) => {
      const nonExistentId = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

      request
        .execute(uri)
        .put(`/actors/${nonExistentId}`)
        .send(updateActor)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });

  describe("DELETE /actors/:id - Remover Ator", () => {
    it("Deve retornar status 204 (No Content) ao remover o ator", (done) => {
      expect(actorId, "actorId não definido antes do DELETE /actors/:id").to
        .exist;

      request
        .execute(uri)
        .delete(`/actors/${actorId}`)
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    });

    it("Deve retornar status 404 se tentar buscar o ator deletado", (done) => {
      request
        .execute(uri)
        .get(`/actors/${actorId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });

    it("Deve retornar status 404 se tentar remover um ator que não existe", (done) => {
      const nonExistentId = "cccccccc-cccc-cccc-cccc-cccccccccccc";

      request
        .execute(uri)
        .delete(`/actors/${nonExistentId}`)
        .end((err, res) => {
          expect(res).to.have.status(404);
          done();
        });
    });
  });
});
