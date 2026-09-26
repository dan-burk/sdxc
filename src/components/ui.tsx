import type { ReactNode } from 'react'
import type { SchoolClass } from '../types'

interface SegmentedProps<T extends string | number> {
  label: string
  options: T[]
  value: T
  onChange: (value: T) => void
  render?: (option: T) => ReactNode
  showLabel?: boolean
}

export function Segmented<T extends string | number>({ label, options, value, onChange, render, showLabel = true }: SegmentedProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex shrink-0 items-center gap-2">
      {showLabel && <span className="label hidden md:inline">{label}</span>}
      <div className="flex rounded bg-surface-2 p-1">
        {options.map(option => (
          <button
            key={option}
            role="radio"
            aria-checked={option === value}
            onClick={() => onChange(option)}
            className={`relative whitespace-nowrap rounded px-3 py-1 text-sm transition-colors motion-reduce:transition-none ${
              option === value ? 'bg-surface font-semibold text-text shadow-sm' : 'text-muted hover:text-text'
            }`}
          >
            {render ? render(option) : option}
          </button>
        ))}
      </div>
    </div>
  )
}

const CLASS_STYLE: Record<SchoolClass, string> = {
  AA: 'text-aa bg-aa/10',
  A: 'text-a bg-a/10',
  B: 'text-b bg-b/10',
}

export function ClassBadge({ cls }: { cls: SchoolClass }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${CLASS_STYLE[cls]}`}>
      {cls}
    </span>
  )
}

export function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded border border-down/30 bg-down/5 p-4 text-sm text-down">
      <span>{message}</span>
      <button onClick={onRetry} className="shrink-0 rounded border border-down/40 px-3 py-1 font-semibold hover:bg-down/10">
        Retry
      </button>
    </div>
  )
}
