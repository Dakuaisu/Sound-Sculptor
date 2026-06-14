import { cva } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-overline uppercase',
  {
    variants: {
      variant: {
        default: 'border-line bg-surface-2 text-text-2',
        primary: 'border-primary-500/30 bg-primary-500/10 text-primary-200',
        amber: 'border-amber/30 bg-amber/10 text-amber',
        success: 'border-success/30 bg-success-bg text-success',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export default function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
