import { motion } from 'framer-motion'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'

/**
 * Empty / not-found state with an icon, copy, and an optional action.
 * @param {object} props
 * @param {React.ComponentType<any>} props.icon - a lucide icon component
 */
export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <motion.div
      variants={fadeUp}
      initial="initial"
      animate="animate"
      className={cn('mx-auto flex max-w-md flex-col items-center px-6 py-16 text-center', className)}
    >
      {Icon && (
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-line bg-surface-2 text-text-3">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
      )}
      <h3 className="mb-2 text-h3 text-text-1">{title}</h3>
      {description && <p className="mb-6 text-body-sm text-text-3">{description}</p>}
      {action}
    </motion.div>
  )
}
