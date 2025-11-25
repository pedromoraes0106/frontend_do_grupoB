import React, { useState } from "react";
import { useAppContext } from "../../AppContext";
import "./MovieActors.css";

export const MovieActorList = () => {
  const {
    movies,
    actors,
    error,
    carregarFilmes,
    carregarAtores,
    carregarAtoresDoFilme,
    movieActors,
    criarFilmeAtor,
    deletarFilmeAtor,
  } = useAppContext();
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    filme_id: "",
    ator_id: "",
    papel: "",
    ordem_credito: "",
  });

  React.useEffect(() => {
    carregarFilmes();
    carregarAtores();
  }, []);

  React.useEffect(() => {
    if (selectedMovieId) {
      carregarAtoresDoFilme(selectedMovieId);
    }
  }, [selectedMovieId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "ordem_credito" ? (value ? parseInt(value) : "") : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovieId) return;

    try {
      const submitData = {
        filme_id: selectedMovieId,
        ator_id: formData.ator_id,
        papel: formData.papel || null,
        ordem_credito: formData.ordem_credito || null,
      };

      await criarFilmeAtor(submitData);
      await carregarAtoresDoFilme(selectedMovieId);
      setFormData({ filme_id: "", ator_id: "", papel: "", ordem_credito: "" });
      setShowForm(false);
    } catch (err) {
      alert("Erro: " + (err.message || err));
    }
  };

  const handleDelete = async (filmId, actorId) => {
    if (window.confirm("Remover ator do filme?")) {
      try {
        await deletarFilmeAtor(filmId, actorId);
        await carregarAtoresDoFilme(selectedMovieId);
      } catch (err) {
        alert("Erro ao remover: ", err);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ filme_id: "", ator_id: "", papel: "", ordem_credito: "" });
  };

  const getActorName = (actorId) => {
    const actor = actors.find((a) => a.id === actorId);
    return actor ? actor.nome : "Ator não encontrado";
  };

  return (
    <div className="container">
      <h2>Elenco & Casting</h2>
      {error && <div className="error">{error}</div>}

      {/* Área do Seletor Principal - Com classe nova para estilo */}
      <div className="movie-selector-area">
        <label>Gerenciar elenco do filme:</label>
        <select
          value={selectedMovieId}
          onChange={(e) => setSelectedMovieId(e.target.value)}
        >
          <option value="">-- Selecione um filme --</option>
          {movies.map((movie) => (
            <option key={movie.id} value={movie.id}>
              {movie.titulo}
            </option>
          ))}
        </select>
      </div>

      {selectedMovieId && !showForm && (
        <button className="btn-add-actor" onClick={() => setShowForm(true)}>
          + Adicionar Ator ao Elenco
        </button>
      )}

      {selectedMovieId && showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>Novo Papel</h3>
          <div className="form-group">
            <label>Ator</label>
            <select
              name="ator_id"
              value={formData.ator_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um ator...</option>
              {actors.map((actor) => (
                <option key={actor.id} value={actor.id}>
                  {actor.nome}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Papel (Personagem)</label>
            <input
              type="text"
              name="papel"
              value={formData.papel}
              onChange={handleInputChange}
              placeholder="Ex: Protagonista"
            />
          </div>
          <div className="form-group">
            <label>Ordem nos Créditos</label>
            <input
              type="number"
              name="ordem_credito"
              value={formData.ordem_credito}
              onChange={handleInputChange}
              placeholder="1"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-success">
              Confirmar
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {selectedMovieId && (
        <>
          <div className="actors-grid">
            {movieActors.length === 0 ? (
              <p style={{ color: "#666", gridColumn: "1/-1" }}>
                Nenhum ator neste filme ainda.
              </p>
            ) : (
              movieActors.map((ma) => (
                <div key={`${ma.id || ma.ator_id}`} className="actor-card">
                  <div>
                    <h4>{getActorName(ma.ator_id || ma.id)}</h4>
                    {ma.papel && <p>Papel: {ma.papel}</p>}
                    {ma.ordem_credito && <p>Ordem: {ma.ordem_credito}º</p>}
                  </div>
                  <button
                    className="btn-remove"
                    onClick={() =>
                      handleDelete(selectedMovieId, ma.ator_id || ma.id)
                    }
                  >
                    Remover
                  </button>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
