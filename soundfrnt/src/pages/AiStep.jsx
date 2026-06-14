import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Shuffle, Sparkles, ArrowLeft } from 'lucide-react'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import Badge from '@/components/ui/Badge'
import { GenerationLoader } from '@/components/ui/Loader'
import useStore from '@/stores/useStore'
import api from '@/services/api'
import { staggerContainer, staggerItem } from '@/lib/motion'

const SUGGESTIONS = [
  'Chill lo-fi beats for coding at 2am',
  'Road trip anthems for the open highway',
  'Late night jazz with a glass of wine',
  'Morning coffee acoustic, soft and warm',
  'High-energy workout power mix',
  '90s nostalgia, windows down',
  'Dark academia study focus',
  'Sunset beach party, golden hour',
  'Dreamy shoegaze to disappear into',
  'Heartbreak anthems for the drive home',
]

const STAGES = [
  'Reading your prompt…',
  'Composing a tracklist…',
  'Finding the songs on Spotify…',
  'Building your playlist…',
]

export default function AiStep() {
  const navigate = useNavigate()
  const { setPlaylist, setError } = useStore()
  const [prompt, setPrompt] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const shown = SUGGESTIONS.slice(0, 6)

  function surprise() {
    const pool = SUGGESTIONS.filter((s) => s !== prompt)
    setPrompt(pool[Math.floor(Math.random() * pool.length)])
  }

  async function handleSubmit() {
    const value = prompt.trim()
    if (!value) return
    setSubmitting(true)
    try {
      const result = await api.generateAiPlaylist(value)
      setPlaylist({ ...result, source: 'ai' })
      navigate('/finished')
    } catch (err) {
      setError(err.message)
      setSubmitting(false)
    }
  }

  if (submitting) {
    return <GenerationLoader title="Sculpting your playlist" stages={STAGES} />
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-4 py-12 sm:py-16">
      <motion.div variants={staggerContainer(0.07)} initial="initial" animate="animate">
        <motion.button
          variants={staggerItem}
          onClick={() => navigate('/choice')}
          className="mb-8 inline-flex items-center gap-1.5 text-body-sm text-text-3 transition-colors hover:text-text-1"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </motion.button>

        <motion.div variants={staggerItem}>
          <Badge variant="primary" className="mb-4">
            <Sparkles className="h-3 w-3" /> AI mode
          </Badge>
          <h1 className="text-h1 text-text-1">Describe your vibe</h1>
          <p className="mt-3 text-body text-text-3">
            A feeling, a moment, an activity — the more vivid, the better the playlist.
          </p>
        </motion.div>

        <motion.div
          variants={staggerItem}
          className="mt-7 rounded-xl border border-line bg-surface-2 p-2 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/30"
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
            rows={3}
            maxLength={500}
            autoFocus
            placeholder="e.g. Rainy Sunday with old vinyl and slow coffee…"
            aria-label="Describe the playlist you want"
            className="w-full resize-none bg-transparent px-3 py-2 text-body-lg text-text-1 placeholder:text-text-3 focus-visible:outline-none"
          />
          <div className="flex items-center justify-between gap-3 px-2 pb-1">
            <span className="tnum text-caption text-text-3">{prompt.length}/500</span>
            <Button onClick={handleSubmit} disabled={!prompt.trim()}>
              Create playlist <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <motion.div variants={staggerItem} className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-caption text-text-3">Need a spark?</p>
            <button
              onClick={surprise}
              className="inline-flex items-center gap-1.5 text-caption font-medium text-primary-300 transition-colors hover:text-primary-200"
            >
              <Shuffle className="h-3.5 w-3.5" /> Surprise me
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {shown.map((s) => (
              <Chip key={s} selected={prompt === s} onClick={() => setPrompt(s)}>
                {s}
              </Chip>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
