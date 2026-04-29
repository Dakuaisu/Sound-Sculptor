import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'

const MOODS = ['Happy', 'Sad', 'Excited', 'Calm', 'Energetic', 'Reflective']

export default function MoodStep() {
  const navigate = useNavigate()
  const { selectedMoods, toggleMood } = useStore()

  return (
    <div className="container">
      <div className="container2">
        <h1>How are you feeling?</h1>
        <p className="subheading">Select your mood(s)</p>
        <div className="step-buttons">
          {MOODS.map((mood) => (
            <button
              key={mood}
              className={`mood-button ${selectedMoods.includes(mood) ? 'selected' : ''}`}
              onClick={() => toggleMood(mood)}
            >
              {mood}
            </button>
          ))}
        </div>
        <button
          className="next-button"
          onClick={() => navigate('/create/genre')}
          disabled={selectedMoods.length === 0}
        >
          Next
        </button>
      </div>
    </div>
  )
}
