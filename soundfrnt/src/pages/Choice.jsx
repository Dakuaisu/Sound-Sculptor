import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, SlidersHorizontal, ArrowRight } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Equalizer from '@/components/ui/Equalizer'
import { staggerContainer, staggerItem } from '@/lib/motion'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

const PATHS = [
  {
    to: '/create/ai',
    icon: Sparkles,
    eyebrow: 'Fastest',
    title: 'Describe it',
    desc: 'Type a vibe in plain words and let AI compose the tracklist.',
    gradient: 'from-primary-500 to-primary-800',
    recommended: true,
  },
  {
    to: '/create/mood',
    icon: SlidersHorizontal,
    eyebrow: 'Most control',
    title: 'Sculpt it',
    desc: 'Pick moods and genres, then fine-tune seven audio dimensions by hand.',
    gradient: 'from-amber to-primary-700',
    recommended: false,
  },
]

export default function Choice() {
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex w-full max-w-content flex-1 flex-col justify-center px-4 py-16 sm:px-6">
      <motion.div variants={staggerContainer(0.08)} initial="initial" animate="animate">
        <motion.div variants={staggerItem} className="mb-10 text-center">
          <Badge variant="primary" className="mb-4">Step 1</Badge>
          <h1 className="text-h1 text-text-1">How do you want to create?</h1>
          <p className="mt-3 text-body text-text-3">Two paths, same destination — a playlist in your library.</p>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2">
          {PATHS.map((p) => (
            <motion.button
              key={p.to}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.99 }}
              transition={spring.soft}
              onClick={() => navigate(p.to)}
              className="group relative overflow-hidden rounded-xl border border-line bg-surface-1 p-7 text-left shadow-e2 transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
            >
              <div
                className={cn(
                  'pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-320 group-hover:opacity-35',
                  p.gradient
                )}
              />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <span className={cn('flex h-12 w-12 items-center justify-center rounded-md bg-gradient-to-br text-white', p.gradient)}>
                    <p.icon className="h-6 w-6" />
                  </span>
                  {p.recommended ? (
                    <Badge variant="primary">Recommended</Badge>
                  ) : (
                    <Equalizer bars={5} className="h-6 w-10 text-text-3 opacity-60" />
                  )}
                </div>
                <p className="text-overline uppercase text-text-3">{p.eyebrow}</p>
                <h2 className="mt-1 text-h2 text-text-1">{p.title}</h2>
                <p className="mt-2 text-body-sm text-text-3">{p.desc}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 text-body-sm font-semibold text-primary-300 transition-transform duration-200 group-hover:translate-x-1">
                  Continue <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
