import { cn } from '@/lib/cn'

/**
 * Lightweight SVG radar that morphs in real time with audio-feature values.
 * @param {object} props
 * @param {{label:string,value:number}[]} props.values - value is 0-100
 */
export default function RadarChart({ values, size = 220, className }) {
  const n = values.length
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 18
  const angle = (i) => (Math.PI * 2 * i) / n - Math.PI / 2
  const pt = (i, scale) => [cx + r * scale * Math.cos(angle(i)), cy + r * scale * Math.sin(angle(i))]
  const shape = values.map((v, i) => pt(i, Math.max(0.04, v.value / 100)).join(',')).join(' ')
  const rings = [0.25, 0.5, 0.75, 1]

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={cn('h-full w-full', className)} role="img" aria-label="Audio feature shape">
      {rings.map((ring) => (
        <polygon
          key={ring}
          points={values.map((_, i) => pt(i, ring).join(',')).join(' ')}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {values.map((_, i) => {
        const [x, y] = pt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      })}
      <polygon
        points={shape}
        fill="rgba(161,94,248,0.22)"
        stroke="#A15EF8"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transition: 'all 220ms cubic-bezier(0.16,1,0.3,1)' }}
      />
      {values.map((v, i) => {
        const [x, y] = pt(i, Math.max(0.04, v.value / 100))
        return <circle key={i} cx={x} cy={y} r="3" fill="#CBADFB" style={{ transition: 'all 220ms cubic-bezier(0.16,1,0.3,1)' }} />
      })}
    </svg>
  )
}
