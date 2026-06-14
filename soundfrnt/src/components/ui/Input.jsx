import { forwardRef, useId } from 'react'
import { cn } from '@/lib/cn'

const base =
  'w-full rounded-md border border-line bg-surface-2/60 px-4 text-body text-text-1 placeholder:text-text-3 transition-colors duration-200 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/30 disabled:opacity-50'

/** Text input with optional label + error + helper text. */
export const Input = forwardRef(function Input(
  { className, label, error, helper, id, ...props },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-caption font-medium text-text-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(base, 'h-12', error && 'border-danger focus-visible:border-danger focus-visible:ring-danger/30', className)}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
        {...props}
      />
      {error && (
        <p id={`${inputId}-error`} className="mt-2 text-caption text-danger" role="alert">
          {error}
        </p>
      )}
      {!error && helper && (
        <p id={`${inputId}-helper`} className="mt-2 text-caption text-text-3">
          {helper}
        </p>
      )}
    </div>
  )
})

/** Multiline input. */
export const Textarea = forwardRef(function Textarea({ className, label, error, id, ...props }, ref) {
  const generatedId = useId()
  const inputId = id || generatedId
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="mb-2 block text-caption font-medium text-text-2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={cn(base, 'min-h-[120px] resize-none py-3 leading-relaxed', error && 'border-danger', className)}
        aria-invalid={!!error}
        {...props}
      />
    </div>
  )
})

export default Input
