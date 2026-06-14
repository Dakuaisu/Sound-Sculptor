import { motion } from 'framer-motion'
import Stepper from '@/components/ui/Stepper'
import { fadeUp } from '@/lib/motion'

export const WIZARD_STEPS = [
  { key: 'mood', label: 'Mood' },
  { key: 'genre', label: 'Genre' },
  { key: 'tune', label: 'Tune' },
]

/**
 * Shared chrome for the three-step "Sculpt it" wizard:
 * a progress stepper, animated header, content, and a footer action row.
 */
export default function WizardShell({ step, title, subtitle, children, footer }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-10 sm:py-14">
      <Stepper steps={WIZARD_STEPS} current={step} className="mb-10" />
      <motion.div variants={fadeUp} initial="initial" animate="animate" className="flex flex-1 flex-col">
        <h1 className="text-h1 text-text-1">{title}</h1>
        {subtitle && <p className="mt-2 text-body text-text-3">{subtitle}</p>}
        <div className="mt-8 flex-1">{children}</div>
        {footer && <div className="mt-10 flex items-center justify-between gap-3">{footer}</div>}
      </motion.div>
    </div>
  )
}
