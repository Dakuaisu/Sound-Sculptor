import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'
import api from '@/services/api'
import Spinner from '@/components/Spinner'

const SUGGESTIONS = [
  'Chill Vibes for a Rainy Day',
  'Road Trip Anthems',
  'Feel-Good Classics',
  'Late Night Jazz',
  'Morning Coffee Acoustic',
  'Workout Power Mix',
  'Study Focus Beats',
  'Sunset Beach Party',
  '90s Nostalgia',
  'Indie Discovery',
  'Dark Academia Vibes',
  'Heartbreak Anthems',
  'Sunday Morning Soul',
  'Cyberpunk Synthwave',
  'Classical for Concentration',
  'Hip Hop Underground',
  'Dreamy Shoegaze',
  'K-Pop Energy',
  'Bollywood Beats',
  'Lofi Sleep Mix',
]

export default function AiStep() {
  const navigate = useNavigate()
  const { setPlaylist, setError } = useStore()
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleSuggestion() {
    const remaining = SUGGESTIONS.filter((s) => s !== prompt)
    const random = remaining[Math.floor(Math.random() * remaining.length)]
    setPrompt(random)
  }

  async function handleSubmit() {
    if (!prompt.trim()) return

    setSubmitting(true)
    try {
      const result = await api.generateAiPlaylist(prompt.trim())
      setPlaylist(result)
      navigate('/finished')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <Spinner message="AI is crafting your playlist..." />
  }

  return (
    <div className="container">
      <div className="container2">
        <h1>Describe Your Vibe</h1>
        <p className="subheading">Tell AI what kind of playlist you want</p>
        <div className="input-container">
          <input
            id="promptInput"
            type="text"
            placeholder="e.g. Chill lo-fi beats for studying at 2am..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            maxLength={500}
          />
        </div>
        <button className="suggest-button" onClick={handleSuggestion}>
          Get Random Suggestion
        </button>
        <button
          className="pretty-button"
          onClick={handleSubmit}
          disabled={!prompt.trim()}
          style={{ marginTop: '1rem' }}
        >
          Create Playlist
        </button>
      </div>
    </div>
  )
}
