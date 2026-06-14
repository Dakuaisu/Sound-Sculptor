import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { overlayVariants, panelVariants } from '@/lib/motion'
import { cn } from '@/lib/cn'

/**
 * Accessible modal dialog (Escape to close, backdrop click, scroll lock, focus).
 * @param {object} props
 * @param {boolean} props.open
 * @param {()=>void} props.onClose
 */
export default function Modal({ open, onClose, title, description, children, className }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const t = setTimeout(() => panelRef.current?.focus(), 0)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
      clearTimeout(t)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            variants={overlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            variants={panelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={cn(
              'relative z-10 w-full max-w-md rounded-xl border border-line bg-surface-3 p-6 shadow-e3 focus-visible:outline-none',
              className
            )}
          >
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-text-3 transition-colors hover:bg-white/5 hover:text-text-1"
            >
              <X className="h-4 w-4" />
            </button>
            {title && <h2 className="mb-1 pr-8 text-h3 text-text-1">{title}</h2>}
            {description && <p className="mb-5 text-body-sm text-text-3">{description}</p>}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
