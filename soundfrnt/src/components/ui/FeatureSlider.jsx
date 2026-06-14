import { cn } from '@/lib/cn'

/**
 * Premium audio-feature slider — built on a native range input for full
 * keyboard + screen-reader support, with a custom fill, thumb, and value badge.
 * @param {object} props
 * @param {string} props.label
 * @param {string} props.leftLabel
 * @param {string} props.rightLabel
 * @param {number} props.value 0-100
 * @param {(v:number)=>void} props.onChange
 * @param {React.ReactNode} [props.icon]
 */
export default function FeatureSlider({ label, leftLabel, rightLabel, value, onChange, icon, className }) {
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cn('group select-none', className)}>
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="flex items-center gap-2 text-body-sm font-medium text-text-1">
          {icon && <span className="text-text-3">{icon}</span>}
          {label}
        </span>
        <span className="tnum rounded-pill bg-surface-2 px-2 py-0.5 text-caption text-primary-200">{pct}</span>
      </div>

      <div className="relative flex h-6 items-center">
        <input
          type="range"
          min="0"
          max="100"
          value={pct}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label={`${label}: ${leftLabel} to ${rightLabel}`}
          className="peer absolute inset-0 z-20 w-full cursor-pointer opacity-0"
        />
        {/* track */}
        <div className="absolute inset-x-0 z-0 h-2 overflow-hidden rounded-pill bg-surface-2">
          <div className="h-full rounded-pill bg-grad-primary" style={{ width: `${pct}%` }} />
        </div>
        {/* thumb */}
        <div
          className="pointer-events-none absolute z-10 h-5 w-5 -translate-x-1/2 rounded-full bg-white shadow-e2 ring-2 ring-primary-500 transition-transform duration-200 ease-out-expo peer-hover:scale-105 peer-active:scale-110 peer-focus-visible:ring-4 peer-focus-visible:ring-primary-500/40"
          style={{ left: `${pct}%` }}
        />
      </div>

      <div className="mt-2 flex justify-between text-caption text-text-3">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}
