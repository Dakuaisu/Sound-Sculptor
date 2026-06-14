import { cn } from '@/lib/cn'

/** Shimmering skeleton block. */
export function Skeleton({ className }) {
  return (
    <div className={cn('relative overflow-hidden rounded-md bg-surface-2', className)}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}

/** A row that mimics a track item, for results loading. */
export function SkeletonTrackRow() {
  return (
    <div className="flex items-center gap-3 rounded-md p-2">
      <Skeleton className="h-12 w-12 shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-1/2" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="h-3 w-8" />
    </div>
  )
}

export default Skeleton
