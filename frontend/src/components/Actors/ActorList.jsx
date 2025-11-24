import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import './Actors.css';

export const ActorList = () => {
  const { actors, loading, error, carregarAtores, deletarAtor, criarAtor, atualizarAtor } = useAppContext();
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    nascimento: '',
    biografia: '',
    nacionalidade: '',
  });

  React.useEffect(() => {
    carregarAtores();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await atualizarAtor(editingId, formData);
      } else {
        await criarAtor(formData);
      }
      await carregarAtores();
      setFormData({ nome: '', nascimento: '', biografia: '', nacionalidade: '' });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      alert('Erro ao salvar ator: ' + err.message);
    }
  };

  const handleEdit = (actor) => {
    setFormData({
      nome: actor.nome,
      nascimento: actor.nascimento || '',
      biografia: actor.biografia || '',
      nacionalidade: actor.nacionalidade || '',
    });
    setEditingId(actor.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar este ator?')) {
      try {
        await deletarAtor(id);
      } catch (err) {
        console.error(err);
        alert('Erro ao deletar ator: ' + (err.message || err));
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ nome: '', nascimento: '', biografia: '', nacionalidade: '' });
  };

  return (
    <div className="container">
      <h2>Atores</h2>
      {error && <div className="error">{error}</div>}
      
      {!showForm && (
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          + Adicionar Ator
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="form">
          <h3>{editingId ? 'Editar Ator' : 'Novo Ator'}</h3>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Data de Nascimento</label>
            <input
              type="date"
              name="nascimento"
              value={formData.nascimento}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Nacionalidade</label>
            <input
              type="text"
              name="nacionalidade"
              value={formData.nacionalidade}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Biografia</label>
            <textarea
              name="biografia"
              value={formData.biografia}
              onChange={handleInputChange}
              rows="4"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="btn-success">Salvar</button>
            <button type="button" className="btn-secondary" onClick={handleCancel}>Cancelar</button>
          </div>
        </form>
      )}

      {loading && <p>Carregando...</p>}
      
      <div className="list">
        {actors.map(actor => (
          <div key={actor.id} className="card">
            <div className="card-content">
              <h3>{actor.nome}</h3>
              <p><strong>Nacionalidade:</strong> {actor.nacionalidade}</p>
              <p><strong>Data de Nascimento:</strong> {actor.nascimento ? new Date(actor.nascimento).toLocaleDateString() : 'N/A'}</p>
              {actor.biografia && (
                <p><strong>Biografia:</strong> {actor.biografia.substring(0, 100)}...</p>
              )}
            </div>
            <div className="card-actions">
              <button className="btn-edit" onClick={() => handleEdit(actor)}>Editar</button>
              <button className="btn-delete" onClick={() => handleDelete(actor.id)}>Deletar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
