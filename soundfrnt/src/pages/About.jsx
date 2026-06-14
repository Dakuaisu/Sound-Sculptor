import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, SlidersHorizontal, ListMusic, ArrowRight } from 'lucide-react'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { fadeUp, staggerContainer, staggerItem } from '@/lib/motion'

const STEPS = [
  { icon: Sparkles, title: 'Describe or sculpt', body: 'Type a vibe in plain words, or hand-tune seven audio dimensions on the control panel.' },
  { icon: SlidersHorizontal, title: 'We find the tracks', body: 'AI composes a tracklist, or a model trained on 1M+ songs recommends matches — then we look them up on Spotify.' },
  { icon: ListMusic, title: 'Save to your library', body: 'Preview the full playlist inline and save it straight to Spotify in a single tap.' },
]

const TECH = ['React', 'Framer Motion', 'Flask', 'scikit-learn', 'Spotify Web API', 'OpenAI']

export default function About() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto w-full max-w-content px-4 py-16 sm:px-6">
      <motion.header variants={fadeUp} initial="initial" animate="animate" className="mx-auto max-w-measure text-center">
        <Badge variant="primary" className="mb-4">About</Badge>
        <h1 className="text-h1 text-text-1">Playlists that match a feeling</h1>
        <p className="mt-4 text-body-lg text-text-2">
          Sound Sculptor is an AI-powered playlist generator that turns a mood — or a sentence — into a
          real Spotify playlist. Two ways in, one playlist out.
        </p>
      </motion.header>

      <motion.div
        variants={staggerContainer(0.08)}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, margin: '-80px' }}
        className="mx-auto mt-14 grid max-w-4xl gap-5 md:grid-cols-3"
      >
        {STEPS.map((s, i) => (
          <motion.div key={s.title} variants={staggerItem} className="rounded-xl border border-line bg-surface-1 p-6 shadow-e2">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary-500/12 text-primary-300">
              <s.icon className="h-5 w-5" />
            </span>
            <p className="mb-1 text-overline uppercase text-text-3">Step {i + 1}</p>
            <h3 className="mb-2 text-h3 text-text-1">{s.title}</h3>
            <p className="text-body-sm text-text-3">{s.body}</p>
          </motion.div>
        ))}
      </motion.div>

      <div className="mx-auto mt-14 max-w-measure text-center">
        <p className="mb-4 text-caption text-text-3">Built with</p>
        <div className="flex flex-wrap justify-center gap-2">
          {TECH.map((t) => (
            <Badge key={t}>{t}</Badge>
          ))}
        </div>
        <div className="mt-10">
          <Button size="lg" onClick={() => navigate('/connect')}>
            Start sculpting <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
