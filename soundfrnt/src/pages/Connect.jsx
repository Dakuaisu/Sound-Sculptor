import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, ShieldCheck, ArrowRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Loader } from '@/components/ui/Loader'
import useStore from '@/stores/useStore'
import { fadeUp } from '@/lib/motion'

function SpotifyGlyph({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.5 17.3a.75.75 0 0 1-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 1 1-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.36.22.47.69.25 1.03zm1.47-3.27a.94.94 0 0 1-1.29.31c-3.23-1.99-8.16-2.56-11.98-1.4a.94.94 0 1 1-.55-1.8c4.37-1.33 9.8-.69 13.51 1.59.44.27.58.85.31 1.3zm.13-3.4C15.78 8.23 8.9 8 5.1 9.16a1.12 1.12 0 1 1-.65-2.15c4.37-1.33 11.96-1.07 16.2 1.45a1.12 1.12 0 1 1-1.15 1.92z" />
    </svg>
  )
}

const PERMS = [
  'Create playlists and save them to your library',
  'Read your public profile and display name',
  'We never post, follow, or delete without you asking',
]

export default function Connect() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, authReady } = useStore()
  const from = location.state?.from || '/choice'

  useEffect(() => {
    if (authReady && isAuthenticated) navigate(from, { replace: true })
  }, [authReady, isAuthenticated, from, navigate])

  if (!authReady || isAuthenticated) {
    return <Loader message="Checking your Spotify connection…" />
  }

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="w-full max-w-md">
        <Card variant="raised" className="overflow-hidden p-0">
          <div className="relative flex flex-col items-center bg-gradient-to-b from-primary-900/40 to-transparent px-8 pt-10 pb-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#1DB954] text-black shadow-glow-primary">
              <SpotifyGlyph className="h-9 w-9" />
            </span>
            <h1 className="mt-5 text-h2 text-text-1">Connect your Spotify</h1>
            <p className="mt-2 max-w-xs text-body-sm text-text-3">
              Link your account so Sound Sculptor can build playlists and save them to your library.
            </p>
          </div>

          <div className="px-8 pb-8">
            <ul className="mb-7 space-y-3">
              {PERMS.map((perm) => (
                <li key={perm} className="flex items-start gap-3 text-body-sm text-text-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  {perm}
                </li>
              ))}
            </ul>

            <Button
              href="/api/connect"
              variant="primary"
              size="lg"
              className="w-full bg-[#1DB954] text-black shadow-none hover:bg-[#1ed760]"
            >
              <SpotifyGlyph className="h-5 w-5" /> Connect with Spotify <ArrowRight className="h-4 w-4" />
            </Button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-caption text-text-3">
              <ShieldCheck className="h-3.5 w-3.5" /> You'll authorize securely on Spotify's site.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
