import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ExternalLink, Share2, RotateCcw, Music2, ListMusic, Sparkles, SearchX, ChevronDown } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Equalizer from '@/components/ui/Equalizer'
import EmptyState from '@/components/ui/EmptyState'
import useStore from '@/stores/useStore'
import { cn } from '@/lib/cn'
import { summarizeMatches, matchHeadline, missingToggleLabel } from '@/lib/matchSummary'
import { staggerContainer, trackItem, fadeUp } from '@/lib/motion'

const COVERS = [
  'from-primary-500 to-primary-900',
  'from-amber to-primary-700',
  'from-info to-primary-600',
  'from-primary-400 to-primary-800',
]

export default function Finished() {
  const navigate = useNavigate()
  const { playlist, resetWizard, clearPlaylist, addToast } = useStore()

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
  const matches = playlist.source === 'ai' ? summarizeMatches(playlist.songs) : null

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
              <div className="flex flex-col items-center gap-3">
                <Equalizer bars={7} className="h-20 w-28 text-white/90" />
              </div>
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
                <p className="text-caption text-text-3">Saved to your Spotify account as a private playlist.</p>
                {playlist.external_url && (
                  <Button href={playlist.external_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" /> Open in Spotify
                  </Button>
                )}
                <Button onClick={handleShare} variant="secondary" size="sm">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button onClick={createAnother} variant="ghost" size="sm" className="mt-1">
                  <RotateCcw className="h-4 w-4" /> Create another
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ----- Tracklist (AI) + live player ----- */}
        <div className="space-y-6">
          {matches && (
            <Card className="p-4 sm:p-5" aria-live="polite">
              <p className="flex items-center gap-2 text-body font-semibold text-text-1">
                {matches.missing.length ? (
                  <SearchX className="h-4 w-4 text-amber" aria-hidden="true" />
                ) : (
                  <Check className="h-4 w-4 text-success" aria-hidden="true" />
                )}
                {matchHeadline(matches)}
              </p>
              {matches.missing.length > 0 && (
                <details className="group mt-3">
                  <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded text-body-sm text-text-2 hover:text-text-1 [&::-webkit-details-marker]:hidden">
                    <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    {missingToggleLabel(matches)}
                  </summary>
                  <ul className="mt-3 space-y-1.5">
                    {matches.missing.map((m, i) => (
                      <li key={`${m.title}-${i}`} className="flex items-baseline justify-between gap-3 text-body-sm">
                        <span className="min-w-0 truncate text-text-2">
                          {m.title} <span className="text-text-3">· {m.artist}</span>
                        </span>
                        <span className="shrink-0 text-caption text-text-3">{m.reason}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-caption text-text-3">
                    The AI suggested these, but they couldn&apos;t be confirmed on Spotify, so they were left out
                    rather than swapped for a different song.
                  </p>
                </details>
              )}
            </Card>
          )}

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
