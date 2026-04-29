import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'

const GENRES = [
  'Pop',
  'Rock',
  'Hip Hop',
  'Jazz',
  'Electronic',
  'Classical',
  'Country',
  'Alternative',
  'Folk',
  'Indie',
  'Hindi',
  'Lofi',
]

export default function GenreStep() {
  const navigate = useNavigate()
  const { selectedGenres, toggleGenre } = useStore()

  return (
    <div className="container">
      <div className="container3">
        <h1>Pick your genres</h1>
        <p className="subheading">Select one or more</p>
        <div className="step2-buttons">
          {GENRES.map((genre) => (
            <button
              key={genre}
              className={`genre-button ${selectedGenres.includes(genre) ? 'selected' : ''}`}
              onClick={() => toggleGenre(genre)}
            >
              {genre}
            </button>
          ))}
        </div>
        <button
          className="next2-button"
          onClick={() => navigate('/create/sliders')}
          disabled={selectedGenres.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  )
}
