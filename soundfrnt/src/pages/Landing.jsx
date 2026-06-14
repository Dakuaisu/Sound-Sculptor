import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, SlidersHorizontal, ListMusic, ArrowRight, Music2, Play } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import Badge from '@/components/ui/Badge'
import Equalizer from '@/components/ui/Equalizer'
import { staggerContainer, staggerItem, fadeUp } from '@/lib/motion'

const VIBES = {
  Focus: {
    gradient: 'from-info via-primary-600 to-primary-900',
    title: 'Deep Focus Flow',
    tracks: [
      ['Weightless', 'Marconi Union'],
      ['Saffron', 'Tycho'],
      ['An Ending', 'Brian Eno'],
    ],
  },
  Hype: {
    gradient: 'from-amber via-primary-500 to-primary-800',
    title: 'Full Send',
    tracks: [
      ['Power', 'Kanye West'],
      ['Levels', 'Avicii'],
      ['Titanium', 'David Guetta'],
    ],
  },
  Chill: {
    gradient: 'from-primary-300 via-primary-500 to-info',
    title: 'Sunday Slow Drift',
    tracks: [
      ['Sunday Morning', 'The Velvet Underground'],
      ['Coffee', 'Sylvan Esso'],
      ['Slow Dancing', 'V'],
    ],
  },
  Heartbreak: {
    gradient: 'from-primary-700 via-primary-800 to-danger',
    title: 'After Midnight',
    tracks: [
      ['Liability', 'Lorde'],
      ['Marvins Room', 'Drake'],
      ['Jealous', 'Labrinth'],
    ],
  },
}

function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-aurora animate-aurora-pan" />
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(80%_60%_at_50%_0%,#000_30%,transparent_100%)]" />
      <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary-600/25 blur-3xl animate-float" />
      <div
        className="absolute -right-16 top-40 h-64 w-64 rounded-full bg-amber/15 blur-3xl animate-float"
        style={{ animationDelay: '1.5s' }}
      />
    </div>
  )
}

function PreviewCard({ vibe }) {
  const data = VIBES[vibe]
  return (
    <Card variant="glass" className="w-full max-w-sm p-5">
      <div className={`relative mb-4 aspect-square w-full overflow-hidden rounded-md bg-gradient-to-br ${data.gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Equalizer bars={7} className="h-16 w-24 text-white/90" />
        </div>
        <span className="absolute bottom-3 left-3 rounded-pill bg-black/30 px-2.5 py-1 text-caption text-white backdrop-blur">
          {vibe}
        </span>
      </div>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-body font-semibold text-text-1">{data.title}</p>
          <p className="text-caption text-text-3">Sound Sculptor · {data.tracks.length} tracks</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-grad-primary text-white">
          <Play className="h-4 w-4 fill-current" />
        </span>
      </div>
      <ul className="space-y-1">
        {data.tracks.map(([name, artist], i) => (
          <motion.li
            key={name}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-white/5"
          >
            <span className="tnum w-4 text-caption text-text-3">{i + 1}</span>
            <Music2 className="h-4 w-4 text-text-3" />
            <span className="flex-1 truncate text-body-sm text-text-2">{name}</span>
            <span className="hidden truncate text-caption text-text-3 sm:block">{artist}</span>
          </motion.li>
        ))}
      </ul>
    </Card>
  )
}

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Describe it in words',
    body: 'Type a vibe — "rainy day lo-fi for coding" — and our AI composes a tracklist, then finds every song on Spotify.',
  },
  {
    icon: SlidersHorizontal,
    title: 'Or sculpt it by hand',
    body: 'Dial in energy, danceability, tempo, and more on a tactile control panel backed by a model trained on 1M+ tracks.',
  },
  {
    icon: ListMusic,
    title: 'Save it to Spotify',
    body: 'Preview the full playlist inline, then save it straight to your library in one tap. No copy-paste, no friction.',
  },
]

export default function Landing() {
  const navigate = useNavigate()
  const [vibe, setVibe] = useState('Focus')

  return (
    <div className="flex flex-1 flex-col">
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24">
        <HeroBackground />
        <div className="mx-auto grid max-w-content items-center gap-12 lg:grid-cols-2">
          <motion.div variants={staggerContainer(0.08)} initial="initial" animate="animate">
            <motion.div variants={staggerItem}>
              <Badge variant="primary" className="mb-6">
                <Sparkles className="h-3 w-3" /> AI + Spotify
              </Badge>
            </motion.div>
            <motion.h1
              variants={staggerItem}
              className="font-display text-display leading-none tracking-tight text-text-1"
            >
              Shape the sound <br />
              <span className="text-gradient">of how you feel</span>
            </motion.h1>
            <motion.p variants={staggerItem} className="mt-6 max-w-md text-body-lg text-text-2">
              Sound Sculptor turns a feeling into a Spotify playlist you own — typed in a sentence
              or carved on a panel of controls.
            </motion.p>
            <motion.div variants={staggerItem} className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={() => navigate('/connect')}>
                Start sculpting <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="ghost" onClick={() => navigate('/about')}>
                See how it works
              </Button>
            </motion.div>

            <motion.div variants={staggerItem} className="mt-10">
              <p className="mb-3 text-caption text-text-3">Try a vibe — watch it change</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(VIBES).map((v) => (
                  <Chip key={v} selected={vibe === v} onClick={() => setVibe(v)}>
                    {v}
                  </Chip>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -1 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
            className="flex justify-center lg:justify-end"
          >
            <PreviewCard vibe={vibe} />
          </motion.div>
        </div>
      </section>

      {/* ---------- SOCIAL PROOF ---------- */}
      <section className="border-y border-line bg-surface-1/40">
        <div className="mx-auto grid max-w-content grid-cols-2 gap-px overflow-hidden md:grid-cols-4">
          {[
            ['1M+', 'tracks modeled'],
            ['2', 'ways to create'],
            ['7', 'audio dimensions'],
            ['1-tap', 'save to Spotify'],
          ].map(([stat, label]) => (
            <div key={label} className="bg-bg px-6 py-8 text-center">
              <p className="font-display text-h2 text-text-1">{stat}</p>
              <p className="mt-1 text-caption text-text-3">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="mx-auto w-full max-w-content px-4 py-20 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="mb-12 max-w-xl"
        >
          <Badge className="mb-4">How it works</Badge>
          <h2 className="text-h1 text-text-1">Two ways in. One playlist out.</h2>
          <p className="mt-3 text-body text-text-3">
            Whether you want to hand the wheel to AI or sculpt every dimension yourself, the result
            is a real playlist in your Spotify library.
          </p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="h-full p-6">
                <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-primary-500/12 text-primary-300">
                  <f.icon className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-h3 text-text-1">{f.title}</h3>
                <p className="text-body-sm text-text-3">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="px-4 pb-24 sm:px-6">
        <motion.div
          variants={fadeUp}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
          className="relative mx-auto max-w-content overflow-hidden rounded-xl border border-line bg-surface-1 px-6 py-16 text-center"
        >
          <div className="pointer-events-none absolute inset-0 bg-aurora" />
          <div className="pointer-events-none absolute -bottom-20 left-1/2 h-64 w-[36rem] -translate-x-1/2 rounded-full bg-primary-600/20 blur-3xl" />
          <div className="relative">
            <Equalizer bars={5} className="mx-auto mb-6 h-8 w-14 text-primary-400" />
            <h2 className="mx-auto max-w-lg text-h1 text-text-1">
              Ready to hear how you feel?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-body text-text-3">
              Connect Spotify and sculpt your first playlist in under a minute.
            </p>
            <Button size="lg" className="mt-8" onClick={() => navigate('/connect')}>
              Start sculpting <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
