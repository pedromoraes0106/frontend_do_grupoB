import React, { createContext, useState } from 'react';
const API_URL = 'http://localhost:3000';

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || '';
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status} - ${text}`);
  }
  if (contentType.includes('application/json')) {
    return await response.json();
  }
  return null;
}

async function get(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`);
  return await parseResponse(res);
}

async function post(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await parseResponse(res);
}

async function put(endpoint, body) {
  const res = await fetch(`${API_URL}${endpoint}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return await parseResponse(res);
}

async function del(endpoint) {
  const res = await fetch(`${API_URL}${endpoint}`, { method: 'DELETE' });
  return await parseResponse(res);
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [movies, setMovies] = useState([]);
  const [actors, setActors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [movieActors, setMovieActors] = useState([]);
  const [loading, setLoading] = useState(false);

  // FILMES
  const carregarFilmes = async () => {
    setLoading(true);
    try {
      const data = await get('/movies');
      setMovies(data);
    } catch (err) {
      console.error('Erro ao carregar filmes', err);
      throw err;
    }
    setLoading(false);
  };

  const criarFilme = async (data) => {
    setLoading(true);
    try {
      await post('/movies', data);
      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao criar filme', err);
      throw err;
    }
    setLoading(false);
  };

  const atualizarFilme = async (id, data) => {
    setLoading(true);
    try {
      await put(`/movies/${id}`, data);
      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao atualizar filme', err);
      throw err;
    }
    setLoading(false);
  };

  const deletarFilme = async (id) => {
    setLoading(true);
    try {
      try {
        const allReviews = await get('/reviews') || [];
        const reviewsToDelete = allReviews
          .filter(r => String(r.filme_id) === String(id))
          .map(r => r.id)
          .filter(Boolean);

        if (reviewsToDelete.length > 0) {
          await Promise.all(
            reviewsToDelete.map(rid => del(`/reviews/${rid}`).catch(err => {
              console.warn(`Falha ao deletar avaliação ${rid}, será removida localmente.`, err.message);
            }))
          );
        }
      } catch (err) {
        console.warn('Aviso: Não foi possível pré-deletar avaliações, será feita limpeza local.', err.message);
      }
      try {
        const relations = await get(`/movie-actors/movie/${id}`) || [];
        if (relations.length > 0) {
          await Promise.all(
            relations.map(r => del(`/movie-actors/${r.ator_id}/${id}`).catch(err => {
              console.warn(`Falha ao deletar relação do ator ${r.ator_id}.`);
            }))
          );
        }
      } catch (err) {
        console.warn('Aviso: Não foi possível pré-deletar relações filme-ator.', err.message);
      }

      await del(`/movies/${id}`);

      setReviews(prev => prev.filter(r => String(r.filme_id) !== String(id)));
      setMovieActors(prev => prev.filter(ma => String(ma.filme_id) !== String(id)));

      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao deletar filme', err);
      throw err;
    }
    setLoading(false);
  };

  // ATORES
  const carregarAtores = async () => {
    setLoading(true);
    try {
      const data = await get('/actors');
      setActors(data);
    } catch (err) {
      console.error('Erro ao carregar atores', err);
      throw err;
    }
    setLoading(false);
  };

  const criarAtor = async (data) => {
    setLoading(true);
    try {
      await post('/actors', data);
      await carregarAtores();
    } catch (err) {
      console.error('Erro ao criar ator', err);
      throw err;
    }
    setLoading(false);
  };

  const atualizarAtor = async (id, data) => {
    setLoading(true);
    try {
      await put(`/actors/${id}`, data);
      await carregarAtores();
    } catch (err) {
      console.error('Erro ao atualizar ator', err);
      throw err;
    }
    setLoading(false);
  };

  const deletarAtor = async (id) => {
    setLoading(true);
    try {
      try {
        const relations = await get(`/movie-actors/actor/${id}`) || [];
        if (relations.length > 0) {
          const toDelete = relations
            .map(r => ({ filmId: r.id || r.filme_id }))
            .filter(x => x.filmId);

          await Promise.all(toDelete.map(r => del(`/movie-actors/${r.filmId}/${id}`).catch(err => {
            console.error(`Erro ao deletar relação filme-ator (filme=${r.filmId}) relacionada ao ator ${id}`, err);
          })));
        }
      } catch (relErr) {
        console.error('Erro ao buscar/deletar relações filme-ator antes de remover ator', relErr);
      }

      await del(`/actors/${id}`);
      setMovieActors(prev => prev.filter(ma => String(ma.ator_id || ma.id) !== String(id)));
      await carregarAtores();
    } catch (err) {
      console.error('Erro ao deletar ator', err);
      throw err;
    }
    setLoading(false);
  };

  // AVALIAÇÕES
  const carregarAvaliacoes = async () => {
    setLoading(true);
    try {
      const data = await get('/reviews');
      setReviews(data);
    } catch (err) {
      console.error('Erro ao carregar avaliações', err);
      throw err;
    }
    setLoading(false);
  };

  const criarAvaliacao = async (data) => {
    setLoading(true);
    try {
      await post('/reviews', data);
      await carregarAvaliacoes();
      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao criar avaliação', err);
      throw err;
    }
    setLoading(false);
  };

  const atualizarAvaliacao = async (id, data) => {
    setLoading(true);
    try {
      await put(`/reviews/${id}`, data);
      await carregarAvaliacoes();
      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao atualizar avaliação', err);
      throw err;
    }
    setLoading(false);
  };

  const deletarAvaliacao = async (id) => {
    setLoading(true);
    try {
      await del(`/reviews/${id}`);
      await carregarAvaliacoes();
      await carregarFilmes();
    } catch (err) {
      console.error('Erro ao deletar avaliação', err);
      throw err;
    }
    setLoading(false);
  };

  // FILME-ATOR
  const carregarAtoresDoFilme = async (filmId) => {
    setLoading(true);
    try {
      const data = await get(`/movie-actors/movie/${filmId}`);
      setMovieActors(data);
    } catch (err) {
      console.error('Erro ao carregar atores do filme', err);
    }
    setLoading(false);
  };

  const criarFilmeAtor = async (data) => {
    setLoading(true);
    try {
      await post('/movie-actors', data);
    } catch (err) {
      console.error('Erro ao associar ator', err);
      throw err;
    }
    setLoading(false);
  };

  const deletarFilmeAtor = async (filmId, actorId) => {
    setLoading(true);
    try {
      await del(`/movie-actors/${filmId}/${actorId}`);
      setMovieActors(prev => prev.filter(ma => String(ma.ator_id || ma.id) !== String(actorId)));
      try {
        await carregarAtoresDoFilme(filmId);
      } catch (err) {
        console.error('Erro ao recarregar atores do filme após deletar relação', err);
      }
    } catch (err) {
      console.error('Erro ao desassociar ator', err);
      throw err;
    }
    setLoading(false);
  };

  const value = {

    movies, actors, reviews, movieActors, loading,
    carregarFilmes, criarFilme, atualizarFilme, deletarFilme,
    carregarAtores, criarAtor, atualizarAtor, deletarAtor,
    carregarAvaliacoes, criarAvaliacao, atualizarAvaliacao, deletarAvaliacao,
    carregarAtoresDoFilme, criarFilmeAtor, deletarFilmeAtor
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
}

export function useAppContext() {
  return React.useContext(AppContext);
}
