import { useNavigate } from 'react-router-dom'
import vinyl from '@/images/vinyl.png'
import image1 from '@/images/image1.png'

export default function Choice() {
  const navigate = useNavigate()

  return (
    <div className="container">
      <h1 className="choice-heading">Choose Your Path</h1>
      <div className="container4">
        <button className="choice" onClick={() => navigate('/create/mood')}>
          <img src={vinyl} alt="Manual" className="choice-icon" />
          <span className="choice-label">Sculpt It Yourself</span>
          <span className="choice-desc">
            Pick moods, genres, and fine-tune audio features
          </span>
        </button>
        <button className="choice" onClick={() => navigate('/create/ai')}>
          <img src={image1} alt="AI" className="choice-icon" />
          <span className="choice-label">AI Generated</span>
          <span className="choice-desc">
            Describe a vibe and let AI build your playlist
          </span>
        </button>
      </div>
    </div>
  )
}
