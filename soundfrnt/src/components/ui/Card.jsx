import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const cardVariants = cva('rounded-lg border transition-colors duration-200', {
  variants: {
    variant: {
      default: 'border-line bg-surface-1 shadow-e2',
      raised: 'border-line bg-surface-1 shadow-e3',
      glass: 'glass border-line shadow-e3',
      ghost: 'border-transparent bg-transparent shadow-none',
    },
    interactive: {
      true: 'cursor-pointer hover:border-line-strong',
      false: '',
    },
  },
  defaultVariants: { variant: 'default', interactive: false },
})

/** Surface primitive. Wrap in motion.div for hover/lift animation. */
const Card = forwardRef(function Card({ className, variant, interactive, ...props }, ref) {
  return <div ref={ref} className={cn(cardVariants({ variant, interactive }), className)} {...props} />
})

export default Card
