import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Wand2, Activity, Zap, Volume2, Guitar, Mic2, Gauge, Radio } from 'lucide-react'
import WizardShell from '@/components/layout/WizardShell'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import FeatureSlider from '@/components/ui/FeatureSlider'
import RadarChart from '@/components/ui/RadarChart'
import Equalizer from '@/components/ui/Equalizer'
import { GenerationLoader } from '@/components/ui/Loader'
import useStore from '@/stores/useStore'
import api from '@/services/api'

const SLIDER_CONFIG = [
  { key: 'danceability', label: 'Danceability', left: 'Still', right: 'Danceable', icon: <Activity className="h-4 w-4" /> },
  { key: 'energy', label: 'Energy', left: 'Calm', right: 'Energetic', icon: <Zap className="h-4 w-4" /> },
  { key: 'loudness', label: 'Loudness', left: 'Quiet', right: 'Loud', icon: <Volume2 className="h-4 w-4" /> },
  { key: 'acousticness', label: 'Acousticness', left: 'Electronic', right: 'Acoustic', icon: <Guitar className="h-4 w-4" /> },
  { key: 'instrumentalness', label: 'Instrumentalness', left: 'Vocal', right: 'Instrumental', icon: <Mic2 className="h-4 w-4" /> },
  { key: 'tempo', label: 'Tempo', left: 'Slow', right: 'Fast', icon: <Gauge className="h-4 w-4" /> },
  { key: 'liveness', label: 'Liveness', left: 'Studio', right: 'Live', icon: <Radio className="h-4 w-4" /> },
]

const MOOD_PRESET = {
  Happy: { danceability: 72, energy: 68, loudness: 62, acousticness: 35, instrumentalness: 15, tempo: 62, liveness: 30 },
  Sad: { danceability: 30, energy: 25, loudness: 35, acousticness: 70, instrumentalness: 35, tempo: 35, liveness: 25 },
  Excited: { danceability: 80, energy: 85, loudness: 75, acousticness: 20, instrumentalness: 10, tempo: 75, liveness: 40 },
  Calm: { danceability: 35, energy: 25, loudness: 30, acousticness: 75, instrumentalness: 45, tempo: 35, liveness: 25 },
  Energetic: { danceability: 78, energy: 88, loudness: 78, acousticness: 18, instrumentalness: 12, tempo: 78, liveness: 42 },
  Reflective: { danceability: 38, energy: 35, loudness: 38, acousticness: 65, instrumentalness: 50, tempo: 45, liveness: 28 },
}

const STAGES = ['Reading your settings…', 'Matching the model…', 'Selecting tracks…', 'Building your playlist…']

export default function SliderStep() {
  const navigate = useNavigate()
  const { sliders, setSlider, selectedMoods, setPlaylist, setError } = useStore()
  const [submitting, setSubmitting] = useState(false)

  const radarValues = SLIDER_CONFIG.map((c) => ({ label: c.label, value: sliders[c.key] }))

  function matchMyMood() {
    if (!selectedMoods.length) return
    const keys = Object.keys(MOOD_PRESET.Happy)
    keys.forEach((key) => {
      const avg = Math.round(
        selectedMoods.reduce((sum, m) => sum + (MOOD_PRESET[m]?.[key] ?? 50), 0) / selectedMoods.length
      )
      setSlider(key, avg)
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const features = {
        danceability: sliders.danceability / 100,
        energy: sliders.energy / 100,
        loudness: -60 + (sliders.loudness / 100) * 60,
        acousticness: sliders.acousticness / 100,
        instrumentalness: sliders.instrumentalness / 100,
        tempo: 40 + (sliders.tempo / 100) * 180,
        liveness: sliders.liveness / 100,
      }

      const result = await api.predict(features)
      const songIds = result.recommended_song_ids || []
      if (songIds.length === 0) {
        setError('No songs matched your settings. Try widening a few sliders.')
        setSubmitting(false)
        return
      }

      const moodPart = selectedMoods.slice(0, 2).join(' & ')
      const name = moodPart ? `${moodPart} Sculpt` : 'Sound Sculptor Mix'
      const playlist = await api.createPlaylist(songIds, name)
      setPlaylist({ ...playlist, playlist_name: name, source: 'manual', total_matched: songIds.length })
      navigate('/finished')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <GenerationLoader title="Creating your playlist" stages={STAGES} />
  }

  return (
    <WizardShell
      step={2}
      title="Fine-tune your sound"
      subtitle="Shape seven dimensions — the chart on the right moves as you do."
      footer={
        <>
          <Button variant="ghost" onClick={() => navigate('/create/genre')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleSubmit}>Generate playlist</Button>
        </>
      }
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_240px]">
        <div className="space-y-6">
          {SLIDER_CONFIG.map((c) => (
            <FeatureSlider
              key={c.key}
              label={c.label}
              leftLabel={c.left}
              rightLabel={c.right}
              icon={c.icon}
              value={sliders[c.key]}
              onChange={(v) => setSlider(c.key, v)}
            />
          ))}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="mx-auto aspect-square w-full max-w-[200px]">
              <RadarChart values={radarValues} />
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-text-3">
              <Equalizer bars={5} className="h-5 w-9 text-primary-400" />
              <span className="text-caption">Your sound signature</span>
            </div>
            {selectedMoods.length > 0 && (
              <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={matchMyMood}>
                <Wand2 className="h-4 w-4" /> Match my mood
              </Button>
            )}
          </Card>
        </div>
      </div>
    </WizardShell>
  )
}
