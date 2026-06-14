import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react'
import useStore from '@/stores/useStore'
import { toastVariants } from '@/lib/motion'
import { cn } from '@/lib/cn'

const CONFIG = {
  success: { icon: CheckCircle2, ring: 'border-success/30', accent: 'text-success' },
  danger: { icon: XCircle, ring: 'border-danger/30', accent: 'text-danger' },
  warn: { icon: AlertTriangle, ring: 'border-warn/30', accent: 'text-warn' },
  info: { icon: Info, ring: 'border-info/30', accent: 'text-info' },
}

/** Global toast stack — driven by the store, AA-friendly, screen-reader announced. */
export default function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const dismissToast = useStore((s) => s.dismissToast)

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-20 z-[200] flex flex-col items-center gap-2 px-4"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const c = CONFIG[t.type] || CONFIG.info
          const Icon = c.icon
          return (
            <motion.div
              key={t.id}
              layout
              variants={toastVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              role={t.type === 'danger' ? 'alert' : 'status'}
              className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-md border bg-surface-3/95 p-3.5 shadow-e3 backdrop-blur',
                c.ring
              )}
            >
              <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', c.accent)} aria-hidden="true" />
              <div className="flex-1">
                {t.title && <p className="text-body-sm font-medium text-text-1">{t.title}</p>}
                {t.message && <p className="mt-0.5 text-caption text-text-3">{t.message}</p>}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                aria-label="Dismiss notification"
                className="-m-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-white/5 hover:text-text-1"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
