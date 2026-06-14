import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Equalizer from './Equalizer'
import { cn } from '@/lib/cn'

/** Simple branded full-area loader. */
export function Loader({ message = 'Loading…', className }) {
  return (
    <div className={cn('flex min-h-[60vh] flex-col items-center justify-center gap-5', className)}>
      <Equalizer bars={7} className="h-10 w-16 text-primary-400" />
      <p className="text-body-sm text-text-3">{message}</p>
    </div>
  )
}

const DEFAULT_STAGES = [
  'Reading your vibe…',
  'Composing the set…',
  'Searching Spotify…',
  'Arranging the tracklist…',
]

/**
 * Cinematic generation loader — turns multi-second latency into a moment.
 * Cycles honest status stages with an indeterminate progress shimmer.
 */
export function GenerationLoader({ title = 'Sculpting your playlist', stages = DEFAULT_STAGES }) {
  const [stage, setStage] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStage((s) => (s + 1) % stages.length), 1500)
    return () => clearInterval(id)
  }, [stages.length])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8 flex h-24 w-24 items-center justify-center rounded-xl bg-grad-primary shadow-glow-primary"
      >
        <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
        <Equalizer bars={5} className="h-10 w-12 text-white" />
      </motion.div>

      <h2 className="mb-3 text-h2 text-text-1">{title}</h2>

      <div className="mb-6 h-6 overflow-hidden" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.p
            key={stage}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="text-body text-text-3"
          >
            {stages[stage]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="relative h-1.5 w-64 max-w-full overflow-hidden rounded-pill bg-surface-2">
        <motion.div
          className="absolute inset-y-0 w-1/2 rounded-pill bg-grad-primary"
          animate={{ x: ['-100%', '200%'] }}
          transition={{ duration: 1.4, ease: 'easeInOut', repeat: Infinity }}
        />
      </div>
    </div>
  )
}

export default Loader
