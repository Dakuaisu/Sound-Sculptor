import { cn } from '@/lib/cn'

const DELAYS = ['0ms', '180ms', '420ms', '120ms', '540ms', '300ms', '60ms']

/**
 * Animated equalizer bars — the brand's core audio motif.
 * Reused as logo mark, loader accent, and ambient decoration.
 * @param {object} props
 * @param {number} [props.bars]
 * @param {boolean} [props.playing]
 * @param {string} [props.barClassName]
 */
export default function Equalizer({ bars = 7, playing = true, className, barClassName }) {
  return (
    <div className={cn('flex h-6 items-center gap-[3px]', className)} aria-hidden="true">
      {Array.from({ length: bars }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'w-[3px] origin-bottom rounded-pill bg-current',
            playing ? 'animate-equalize' : 'h-1/3',
            barClassName
          )}
          style={playing ? { height: '100%', animationDelay: DELAYS[i % DELAYS.length] } : undefined}
        />
      ))}
    </div>
  )
}
