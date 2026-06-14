// Centralized motion tokens + reusable Framer Motion variants.
// Inspired by Linear/Raycast spring physics and Apple's restraint.

export const ease = {
  spring: [0.22, 1, 0.36, 1], // brand: press, step, carve-reveal
  outExpo: [0.16, 1, 0.3, 1], // utilitarian
  smooth: [0.65, 0, 0.35, 1], // gentle flow
}

export const duration = { fast: 0.12, base: 0.2, slow: 0.32, reveal: 0.52 }

export const spring = {
  soft: { type: 'spring', stiffness: 260, damping: 28, mass: 0.9 },
  snappy: { type: 'spring', stiffness: 420, damping: 32 },
  press: { type: 'spring', stiffness: 600, damping: 30 },
}

// Page-level route transition (used with AnimatePresence in App)
export const pageVariants = {
  initial: { opacity: 0, y: 10, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: duration.slow, ease: ease.outExpo } },
  exit: { opacity: 0, y: -8, filter: 'blur(6px)', transition: { duration: duration.base, ease: ease.smooth } },
}

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: duration.slow, ease: ease.outExpo } },
}

// Stagger container + item (for hero blocks, feature grids, chip groups)
export const staggerContainer = (stagger = 0.06, delay = 0) => ({
  initial: {},
  animate: { transition: { staggerChildren: stagger, delayChildren: delay } },
})

export const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } },
}

// Track row reveal (results "carve-in")
export const trackItem = {
  initial: { opacity: 0, x: -16, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: duration.reveal, ease: ease.spring } },
}

// Overlay + panel for modals/sheets
export const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base } },
  exit: { opacity: 0, transition: { duration: duration.base } },
}

export const panelVariants = {
  initial: { opacity: 0, scale: 0.96, y: 12 },
  animate: { opacity: 1, scale: 1, y: 0, transition: spring.soft },
  exit: { opacity: 0, scale: 0.97, y: 8, transition: { duration: duration.base, ease: ease.smooth } },
}

// Toast
export const toastVariants = {
  initial: { opacity: 0, y: -16, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: spring.soft },
  exit: { opacity: 0, y: -12, scale: 0.97, transition: { duration: duration.base, ease: ease.smooth } },
}

// Interaction presets shared by primitives
export const pressable = { whileTap: { scale: 0.97 }, transition: spring.press }
export const lift = { whileHover: { y: -4 }, transition: spring.soft }
