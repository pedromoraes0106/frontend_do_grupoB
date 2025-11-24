import { AppProvider } from './AppContext';
import { MovieList } from './components/Movies/MovieList';
import { ActorList } from './components/Actors/ActorList';
import { ReviewList } from './components/Reviews/ReviewList';
import { MovieActorList } from './components/MovieActors/MovieActorList';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="app">
        <h1 className='title'>Cinema - CRUD</h1>
        <MovieList />
        <ActorList />
        <ReviewList />
        <MovieActorList />
      </div>
    </AppProvider>
  );
}

export default App;
