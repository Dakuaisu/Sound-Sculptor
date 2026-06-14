import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cva } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'

export const buttonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-pill font-ui font-semibold leading-none select-none transition-[color,background-color,border-color,filter,box-shadow] duration-200 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-grad-primary text-text-on-primary shadow-glow-primary hover:brightness-110',
        secondary: 'border border-line bg-surface-2 text-text-1 hover:border-line-strong hover:bg-surface-3',
        ghost: 'bg-transparent text-text-2 hover:bg-white/5 hover:text-text-1',
        outline: 'border border-primary-500/50 bg-transparent text-primary-200 hover:border-primary-500 hover:bg-primary-500/10',
        destructive: 'border border-danger/30 bg-danger/15 text-danger hover:bg-danger/25',
        amber: 'bg-grad-amber text-text-inverse hover:brightness-105',
      },
      size: {
        sm: 'h-9 px-4 text-body-sm',
        md: 'h-11 px-5 text-body-sm',
        lg: 'h-[52px] px-7 text-body',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

const MotionButton = motion.button
const MotionAnchor = motion.a

/**
 * Premium button primitive.
 * @param {object} props
 * @param {'primary'|'secondary'|'ghost'|'outline'|'destructive'|'amber'} [props.variant]
 * @param {'sm'|'md'|'lg'|'icon'} [props.size]
 * @param {boolean} [props.loading]
 * @param {string} [props.href] - renders an <a> instead of <button>
 */
const Button = forwardRef(function Button(
  { className, variant, size, loading = false, disabled, href, children, ...props },
  ref
) {
  const isDisabled = disabled || loading
  const classes = cn(buttonVariants({ variant, size }), className)
  const press = isDisabled ? {} : { whileTap: { scale: 0.97 }, transition: spring.press }

  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  )

  if (href) {
    return (
      <MotionAnchor ref={ref} href={href} className={classes} aria-disabled={isDisabled} {...press} {...props}>
        {content}
      </MotionAnchor>
    )
  }

  return (
    <MotionButton ref={ref} className={classes} disabled={isDisabled} aria-busy={loading} {...press} {...props}>
      {content}
    </MotionButton>
  )
})

export default Button
