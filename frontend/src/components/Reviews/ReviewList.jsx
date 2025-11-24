import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import './Reviews.css';

export const ReviewList = () => {
  const { reviews, movies, loading, error, carregarAvaliacoes, carregarFilmes, deletarAvaliacao, criarAvaliacao, atualizarAvaliacao } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    filme_id: '',
    nome_avaliador: '',
    nota: 5,
    comentario: '',
    recomendado: false,
  });

  React.useEffect(() => {
    carregarAvaliacoes();
    carregarFilmes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await atualizarAvaliacao(editingId, formData);
      } else {
        await criarAvaliacao(formData);
      }
      await carregarAvaliacoes();
      setFormData({ filme_id: '', nome_avaliador: '', nota: 5, comentario: '', recomendado: false });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert('Erro ao salvar avaliação: ' + err.message);
    }
  };

  const handleEdit = (review) => {
    setFormData({
      filme_id: review.filme_id,
      nome_avaliador: review.nome_avaliador,
      nota: review.nota,
      comentario: review.comentario || '',
      recomendado: review.recomendado
    });
    setEditingId(review.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar esta avaliação?')) {
      try {
        await deletarAvaliacao(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao deletar avaliação: ' + (err.message || err));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ filme_id: '', nome_avaliador: '', nota: 5, comentario: '', recomendado: false });
  };

  const getMovieTitle = (filmId) => {
    const movie = movies.find(m => m.id === filmId);
    return movie ? movie.titulo : 'Filme não encontrado';
  };

  return (
    <div className="container">
      <h2>Avaliações</h2>
      {error && <div className="error">{error}</div>}
      
      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Adicionar Avaliação
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editingId ? 'Editar Avaliação' : 'Nova Avaliação'}</h3>
          <div className="form-group">
            <label>Filme</label>
            <select
              name="filme_id"
              value={formData.filme_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Selecione um filme</option>
              {movies.map(movie => (
                <option key={movie.id} value={movie.id}>{movie.titulo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Nome do Avaliador</label>
            <input
              type="text"
              name="nome_avaliador"
              value={formData.nome_avaliador}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Nota (0-10)</label>
            <input
              type="number"
              name="nota"
              min="0"
              max="10"
              value={formData.nota}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Comentário</label>
            <textarea
              name="comentario"
              value={formData.comentario}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="recomendado"
                checked={formData.recomendado}
                onChange={handleInputChange}
              />
              Recomendado
            </label>
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-success">Salvar</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      )}

      {loading && <p>Carregando...</p>}
      
      <div className="list">
        {reviews.map(review => (
          <div key={review.id} className="card">
            <div className="card-content">
              <h3>{getMovieTitle(review.filme_id)}</h3>
              <p><strong>Avaliador:</strong> {review.nome_avaliador}</p>
              <p><strong>Nota:</strong> ⭐ {review.nota}/10</p>
              {review.comentario && (
                <p><strong>Comentário:</strong> {review.comentario}</p>
              )}
              <p><strong>Status:</strong> {review.recomendado ? '👍 Recomendado' : '👎 Não Recomendado'}</p>
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => handleEdit(review)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(review.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
