import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import './MovieActors.css';

export const MovieActorList = () => {
  const { movies, actors, loading, error, carregarFilmes, carregarAtores, carregarAtoresDoFilme, movieActors, criarFilmeAtor, deletarFilmeAtor } = useAppContext();
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    filme_id: '',
    ator_id: '',
    papel: '',
    ordem_credito: '',
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
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ordem_credito' ? (value ? parseInt(value) : '') : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMovieId) {
      alert('Selecione um filme');
      return;
    }

    try {
      const actorId = formData.ator_id;
      const already = movieActors.some(ma => String(ma.ator_id || ma.id) === String(actorId));
      if (already) {
        alert('Atenção: este ator já está associado a este filme.');
        return;
      }
      const submitData = {
        filme_id: selectedMovieId,
        ator_id: formData.ator_id,
        papel: formData.papel || null,
        ordem_credito: formData.ordem_credito || null
      };
      
      await criarFilmeAtor(submitData);
      await carregarAtoresDoFilme(selectedMovieId);
      setFormData({ filme_id: '', ator_id: '', papel: '', ordem_credito: '' });
      setShowForm(false);
      alert('Ator associado com sucesso!');
    } catch (err) {
      console.error(err);
      // Friendly message for unique constraint error from backend
      if (err.message && err.message.toLowerCase().includes('duplicate')) {
        alert('Erro ao associar ator: este ator já está associado ao filme.');
      } else {
        alert('Erro ao associar ator: ' + (err.message || err));
      }
    }
  };

  const handleDelete = async (filmId, actorId) => {
    if (window.confirm('Tem certeza que deseja remover este ator do filme?')) {
      try {
        await deletarFilmeAtor(filmId, actorId);
        await carregarAtoresDoFilme(selectedMovieId);
      } catch (err) {
        alert('Erro ao remover ator');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({ filme_id: '', ator_id: '', papel: '', ordem_credito: '' });
  };

  const getActorName = (actorId) => {
    const actor = actors.find(a => a.id === actorId);
    return actor ? actor.nome : 'Ator não encontrado';
  };

  return (
    <div className="container">
      <h2>Gerenciar Atores em Filmes</h2>
      {error && <div className="error">{error}</div>}

      <div className="form-group">
        <label>Selecione um filme</label>
        <select
          value={selectedMovieId}
          onChange={(e) => setSelectedMovieId(e.target.value)}
        >
          <option value="">-- Selecione um filme --</option>
          {movies.map(movie => (
            <option key={movie.id} value={movie.id}>{movie.titulo}</option>
          ))}
        </select>
      </div>

      {selectedMovieId && !showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Adicionar Ator ao Filme
        </button>
      )}

      {selectedMovieId && showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>Associar Ator ao Filme</h3>
          <div className="form-group">
            <label>Ator</label>
            <select
              name="ator_id"
              value={formData.ator_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um ator</option>
              {actors.map(actor => (
                <option key={actor.id} value={actor.id}>{actor.nome}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Papel</label>
            <input
              type="text"
              name="papel"
              value={formData.papel}
              onChange={handleInputChange}
              placeholder="Ex: Protagonista"
            />
          </div>
          <div className="form-group">
            <label>Ordem de Crédito</label>
            <input
              type="number"
              name="ordem_credito"
              value={formData.ordem_credito}
              onChange={handleInputChange}
              placeholder="1, 2, 3..."
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-success">Salvar</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      )}

      {selectedMovieId && (
        <>
          {loading && <p>Carregando...</p>}
          <h3>Atores do filme</h3>
          <div className="list">
            {movieActors.length === 0 ? (
              <p>Nenhum ator associado a este filme</p>
            ) : (
              movieActors.map(ma => (
                <div key={`${ma.id || ma.ator_id}`} className="card">
                  <div className="card-content">
                    <h4>{getActorName(ma.ator_id || ma.id)}</h4>
                    {ma.papel && <p><strong>Papel:</strong> {ma.papel}</p>}
                    {ma.ordem_credito && <p><strong>Ordem:</strong> {ma.ordem_credito}º</p>}
                  </div>
                  <div className="card-actions">
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(selectedMovieId, ma.ator_id || ma.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
