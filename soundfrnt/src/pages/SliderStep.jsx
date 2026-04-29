import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '@/stores/useStore'
import api from '@/services/api'
import Spinner from '@/components/Spinner'

const SLIDER_CONFIG = [
  { key: 'danceability', left: 'Still', right: 'Danceable' },
  { key: 'energy', left: 'Calm', right: 'Energetic' },
  { key: 'loudness', left: 'Quiet', right: 'Loud' },
  { key: 'acousticness', left: 'Electronic', right: 'Acoustic' },
  { key: 'instrumentalness', left: 'Vocal', right: 'Instrumental' },
  { key: 'tempo', left: 'Slow', right: 'Fast' },
  { key: 'liveness', left: 'Studio', right: 'Live' },
]

export default function SliderStep() {
  const navigate = useNavigate()
  const { sliders, setSlider, setPlaylist, setError } = useStore()
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setSubmitting(true)
    try {
      // Normalize slider values (0-100) to API ranges
      const features = {
        danceability: sliders.danceability / 100,
        energy: sliders.energy / 100,
        loudness: -60 + (sliders.loudness / 100) * 60, // -60 to 0
        acousticness: sliders.acousticness / 100,
        instrumentalness: sliders.instrumentalness / 100,
        tempo: 40 + (sliders.tempo / 100) * 180, // 40 to 220 BPM
        liveness: sliders.liveness / 100,
      }

      const result = await api.predict(features)
      const songIds = result.recommended_song_ids || []

      if (songIds.length === 0) {
        setError('No songs matched your preferences. Try adjusting the sliders.')
        setSubmitting(false)
        return
      }

      const playlist = await api.createPlaylist(songIds)
      setPlaylist(playlist)
      navigate('/finished')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <Spinner message="Creating your playlist..." />
  }

  return (
    <div className="container">
      <div className="container3">
        <h1>Fine-tune your sound</h1>
        <p className="subheading">Adjust the sliders to your preference</p>
        <div className="slider-list">
          {SLIDER_CONFIG.map(({ key, left, right }) => (
            <div key={key} className="slider-container">
              <span className="word">{left}</span>
              <input
                type="range"
                className="slider"
                min="0"
                max="100"
                value={sliders[key]}
                onChange={(e) => setSlider(key, Number(e.target.value))}
              />
              <span className="word">{right}</span>
            </div>
          ))}
        </div>
        <button className="next3-button" onClick={handleSubmit}>
          Generate Playlist
        </button>
      </div>
    </div>
  )
}
