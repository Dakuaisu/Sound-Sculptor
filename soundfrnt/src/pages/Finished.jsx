import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { Check, ExternalLink, Share2, RotateCcw, Music2, ListMusic, Sparkles } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Equalizer from '@/components/ui/Equalizer'
import EmptyState from '@/components/ui/EmptyState'
import useStore from '@/stores/useStore'
import api from '@/services/api'
import { cn } from '@/lib/cn'
import { staggerContainer, trackItem, fadeUp, spring } from '@/lib/motion'

const COVERS = [
  'from-primary-500 to-primary-900',
  'from-amber to-primary-700',
  'from-info to-primary-600',
  'from-primary-400 to-primary-800',
]

function Burst({ show }) {
  const reduce = useReducedMotion()
  if (!show || reduce) return null
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 14 }).map((_, i) => {
        const ang = (i / 14) * Math.PI * 2
        return (
          <motion.span
            key={i}
            initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
            animate={{ opacity: 0, x: Math.cos(ang) * 130, y: Math.sin(ang) * 130, scale: 0.3 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            className="absolute h-2 w-2 rounded-full"
            style={{ background: i % 2 ? '#A15EF8' : '#FF8A5C' }}
          />
        )
      })}
    </div>
  )
}

export default function Finished() {
  const navigate = useNavigate()
  const { playlist, resetWizard, clearPlaylist, addToast, setError } = useStore()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [burst, setBurst] = useState(false)

  if (!playlist) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState
          icon={ListMusic}
          title="No playlist yet"
          description="Looks like you haven't sculpted one. Let's start fresh."
          action={<Button onClick={() => navigate('/choice')}>Create a playlist</Button>}
        />
      </div>
    )
  }

  const name = playlist.playlist_name || 'Your Sound Sculptor Playlist'
  const cover = COVERS[(name.length || 0) % COVERS.length]
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlist.playlist_id}?theme=0`
  const tracks = playlist.source === 'ai' && Array.isArray(playlist.tracks) ? playlist.tracks : null

  async function handleSave() {
    setSaving(true)
    try {
      await api.savePlaylist(playlist.playlist_id)
      setSaved(true)
      setBurst(true)
      setTimeout(() => setBurst(false), 1000)
      addToast({ type: 'success', title: 'Saved to your library', message: name })
    } catch (err) {
      setError(err.message || 'Could not save the playlist. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleShare() {
    const url = playlist.external_url
    if (!url) {
      addToast({ type: 'info', message: 'No shareable link is available yet.' })
      return
    }
    if (navigator.share) {
      try {
        await navigator.share({ title: name, url })
      } catch {
        /* user dismissed */
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        addToast({ type: 'success', title: 'Link copied to clipboard' })
      } catch {
        addToast({ type: 'info', message: url })
      }
    }
  }

  function createAnother() {
    resetWizard()
    clearPlaylist()
    navigate('/choice')
  }

  return (
    <div className="mx-auto w-full max-w-content px-4 py-12 sm:px-6 sm:py-16">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="mb-8 text-center">
        <Badge variant="success" className="mb-4">
          <Check className="h-3 w-3" /> Playlist ready
        </Badge>
        <h1 className="text-h1 text-text-1">Your playlist is ready</h1>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[320px_1fr] lg:items-start">
        {/* ----- Cover + actions ----- */}
        <motion.div variants={fadeUp} initial="initial" animate="animate" className="lg:sticky lg:top-24">
          <Card variant="raised" className="overflow-hidden p-0">
            <div className={cn('relative flex aspect-square items-center justify-center bg-gradient-to-br', cover)}>
              <Burst show={burst} />
              <motion.div
                animate={saved ? { scale: [1, 1.06, 1] } : {}}
                transition={spring.soft}
                className="flex flex-col items-center gap-3"
              >
                <Equalizer bars={7} className="h-20 w-28 text-white/90" />
              </motion.div>
              {saved && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={spring.snappy}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-success text-black shadow-e2"
                >
                  <Check className="h-5 w-5" />
                </motion.span>
              )}
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="truncate text-h3 text-text-1">{name}</h2>
                  <p className="mt-1 flex items-center gap-1.5 text-caption text-text-3">
                    {playlist.source === 'ai' ? <Sparkles className="h-3.5 w-3.5" /> : <Music2 className="h-3.5 w-3.5" />}
                    {playlist.source === 'ai' ? 'AI generated' : 'Hand sculpted'}
                    {playlist.total_matched ? ` · ${playlist.total_matched} tracks` : ''}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5">
                <Button onClick={handleSave} loading={saving} disabled={saved} variant={saved ? 'secondary' : 'primary'}>
                  {saved ? (
                    <>
                      <Check className="h-4 w-4" /> Saved to library
                    </>
                  ) : (
                    'Save to library'
                  )}
                </Button>
                <div className="grid grid-cols-2 gap-2.5">
                  {playlist.external_url && (
                    <Button href={playlist.external_url} target="_blank" rel="noopener noreferrer" variant="secondary" size="sm">
                      <ExternalLink className="h-4 w-4" /> Spotify
                    </Button>
                  )}
                  <Button onClick={handleShare} variant="secondary" size="sm">
                    <Share2 className="h-4 w-4" /> Share
                  </Button>
                </div>
                <Button onClick={createAnother} variant="ghost" size="sm" className="mt-1">
                  <RotateCcw className="h-4 w-4" /> Create another
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ----- Tracklist (AI) + live player ----- */}
        <div className="space-y-6">
          {tracks && (
            <Card className="p-2 sm:p-3">
              <motion.ul variants={staggerContainer(0.05)} initial="initial" animate="animate">
                {tracks.map((t, i) => (
                  <motion.li
                    key={t.id || i}
                    variants={trackItem}
                    className="group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-white/5"
                  >
                    <span className="tnum w-5 text-caption text-text-3">{i + 1}</span>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-surface-3 text-text-3">
                      <Music2 className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-sm font-medium text-text-1">{t.name}</p>
                      <p className="truncate text-caption text-text-3">{t.artist}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ul>
            </Card>
          )}

          <div>
            <p className="mb-3 flex items-center gap-2 text-caption text-text-3">
              <Equalizer bars={4} className="h-4 w-7 text-primary-400" /> Listen & preview
            </p>
            <div className="overflow-hidden rounded-lg border border-line shadow-e2">
              <iframe
                title={`Spotify player for ${name}`}
                src={embedUrl}
                width="100%"
                height="380"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                style={{ display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
