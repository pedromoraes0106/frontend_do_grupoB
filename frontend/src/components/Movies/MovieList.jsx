import React, { useState } from 'react';
import { useAppContext } from '../../AppContext';
import './Movies.css';

export const MovieList = () => {
  const { movies, loading, error, carregarFilmes, deletarFilme, criarFilme, atualizarFilme } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    genero: '',
    duracao_min: '',
    lancamento: '',
    em_cartaz: false,
  });

  React.useEffect(() => {
    carregarFilmes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // sanitize and validate duracao_min
      const dur = formData.duracao_min === '' || formData.duracao_min == null
        ? null
        : parseInt(formData.duracao_min, 10);
      if (dur !== null && (isNaN(dur) || dur <= 0)) {
        alert('A duração deve ser um número inteiro maior que 0');
        return;
      }

      const payload = {
        titulo: formData.titulo,
        genero: formData.genero || null,
        duracao_min: dur,
        lancamento: formData.lancamento || null,
        em_cartaz: !!formData.em_cartaz
      };

      if (editingId) {
        await atualizarFilme(editingId, payload);
      } else {
        await criarFilme(payload);
      }
      await carregarFilmes();
      setFormData({ titulo: '', genero: '', duracao_min: '', lancamento: '', em_cartaz: false });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert('Erro ao salvar filme: ' + (err.message || err));
    }
  };

  const handleEdit = (movie) => {
    setFormData({
      titulo: movie.titulo,
      genero: movie.genero,
      duracao_min: movie.duracao_min,
      lancamento: movie.lancamento,
      em_cartaz: movie.em_cartaz
    });
    setEditingId(movie.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este filme?')) {
      try {
        await deletarFilme(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao deletar filme: ' + (err.message || err));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ titulo: '', genero: '', duracao_min: '', lancamento: '', em_cartaz: false });
  };

  return (
    <div className="container">
      <h2>Filmes</h2>
      {error && <div className="error">{error}</div>}
      
      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Adicionar Filme
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editingId ? 'Editar Filme' : 'Novo Filme'}</h3>
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Gênero</label>
            <input
              type="text"
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Duração (minutos)</label>
            <input
              type="number"
              name="duracao_min"
              value={formData.duracao_min}
              onChange={handleInputChange}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Data de Lançamento</label>
            <input
              type="date"
              name="lancamento"
              value={formData.lancamento}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="em_cartaz"
                checked={formData.em_cartaz}
                onChange={handleInputChange}
              />
              Em Cartaz
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
        {movies.map(movie => (
          <div key={movie.id} className="card">
            <div className="card-content">
              <h3>{movie.titulo}</h3>
              <p><strong>Gênero:</strong> {movie.genero}</p>
              <p><strong>Duração:</strong> {movie.duracao_min} min</p>
              <p><strong>Lançamento:</strong> {new Date(movie.lancamento).toLocaleDateString()}</p>
              <p><strong>Nota Média:</strong> {movie.nota_media} / 10</p>
              <p><strong>Status:</strong> {movie.em_cartaz ? '🎬 Em Cartaz' : 'Fora de Cartaz'}</p>
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => handleEdit(movie)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(movie.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
