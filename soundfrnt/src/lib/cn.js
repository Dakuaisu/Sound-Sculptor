import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Must match theme.extend.fontSize in tailwind.config.js. Unregistered, tailwind-merge
// reads e.g. text-body-sm as a colour and drops the real colour class (or vice versa).
export const CUSTOM_FONT_SIZES = ['display', 'h1', 'h2', 'h3', 'body-lg', 'body', 'body-sm', 'caption', 'overline']

const twMerge = extendTailwindMerge({
  extend: { theme: { text: CUSTOM_FONT_SIZES } },
})

/**
 * Merge conditional class names and resolve Tailwind conflicts.
 * @param {...any} inputs
 * @returns {string}
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
