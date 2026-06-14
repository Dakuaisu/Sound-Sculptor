import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'

/**
 * Horizontal wizard progress indicator.
 * @param {object} props
 * @param {{key:string,label:string}[]} props.steps
 * @param {number} props.current - zero-based index of the active step
 */
export default function Stepper({ steps, current, className }) {
  return (
    <nav aria-label="Progress" className={cn('w-full', className)}>
      <ol className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={step.key} className={cn('flex items-center', i < steps.length - 1 && 'flex-1')}>
              <div className="flex items-center gap-2.5">
                <motion.span
                  initial={false}
                  animate={{ scale: active ? 1 : 0.9 }}
                  transition={spring.snappy}
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-caption font-semibold transition-colors duration-200',
                    done && 'border-primary-500 bg-primary-500 text-text-on-primary',
                    active && 'border-primary-500 bg-primary-500/15 text-primary-200 shadow-glow-primary',
                    !done && !active && 'border-line bg-surface-2 text-text-3'
                  )}
                  aria-current={active ? 'step' : undefined}
                >
                  {done ? <Check className="h-4 w-4" aria-hidden="true" /> : i + 1}
                </motion.span>
                <span
                  className={cn(
                    'hidden text-body-sm font-medium transition-colors duration-200 sm:inline',
                    active ? 'text-text-1' : done ? 'text-text-2' : 'text-text-3'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-3 h-px flex-1 overflow-hidden rounded-pill bg-line">
                  <motion.div
                    initial={false}
                    animate={{ scaleX: done ? 1 : 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full origin-left bg-primary-500"
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
