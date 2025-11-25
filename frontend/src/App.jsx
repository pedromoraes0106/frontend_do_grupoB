import { AppProvider } from "./AppContext";
import { MovieList } from "./components/Movies/MovieList";
import { ActorList } from "./components/Actors/ActorList";
import { ReviewList } from "./components/Reviews/ReviewList";
import { MovieActorList } from "./components/MovieActors/MovieActorList";
import "./App.css";

function App() {
  return (
    <AppProvider>
      <div className="app">
        <header className="main-header">
          <div className="logo-area">
            <a href="/" className="brand-logo">
              CINE<span style={{ color: "white" }}>CRUD</span>
            </a>
          </div>
          <nav className="main-nav">
            <a href="#filmes">Filmes</a>
            <a href="#atores">Atores</a>
            <a href="#avaliacoes">Avaliações</a>
            <a href="#elenco">Elenco</a>
          </nav>
        </header>

        <main className="content-wrapper">
          <section id="filmes">
            <MovieList />
          </section>

          <section id="atores">
            <ActorList />
          </section>

          <section id="avaliacoes">
            <ReviewList />
          </section>

          <section id="elenco">
            <MovieActorList />
          </section>
        </main>
      </div>
    </AppProvider>
  );
}

export default App;
