import Equalizer from '@/components/ui/Equalizer'
import { cn } from '@/lib/cn'

/**
 * Brand lockup: gradient equalizer mark + optional wordmark.
 * @param {object} props
 * @param {boolean} [props.withWordmark]
 */
export default function Logo({ withWordmark = true, className, markClassName }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-md bg-grad-primary shadow-glow-primary',
          markClassName
        )}
      >
        <Equalizer bars={4} className="h-4 w-5 text-white" />
      </span>
      {withWordmark && (
        <span className="font-display text-[1.3rem] font-black leading-none tracking-tight text-text-1">
          Sound Sculptor
        </span>
      )}
    </span>
  )
}
