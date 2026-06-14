import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'

/**
 * Unified selectable pill — used for moods, genres, and suggestions.
 * One consistent shape replaces the old circle-vs-rectangle split.
 * @param {object} props
 * @param {boolean} [props.selected]
 * @param {string} [props.icon] - optional leading emoji/symbol
 */
export default function Chip({ selected = false, icon, children, className, ...props }) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={selected}
      whileTap={{ scale: 0.95 }}
      transition={spring.press}
      className={cn(
        'group relative inline-flex items-center gap-2 rounded-pill border px-4 py-2.5 text-body-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
        selected
          ? 'border-primary-500 bg-primary-500/15 text-text-1 shadow-glow-primary'
          : 'border-line bg-surface-2 text-text-2 hover:border-line-strong hover:bg-surface-3 hover:text-text-1',
        className
      )}
      {...props}
    >
      {icon && <span aria-hidden="true" className="text-body leading-none">{icon}</span>}
      <span>{children}</span>
      <motion.span
        initial={false}
        animate={{ width: selected ? 16 : 0, opacity: selected ? 1 : 0 }}
        transition={spring.snappy}
        className="overflow-hidden"
      >
        <Check className="h-4 w-4 text-primary-300" aria-hidden="true" />
      </motion.span>
    </motion.button>
  )
}
