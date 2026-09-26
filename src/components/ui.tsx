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

interface DropdownProps {
  label: string
  options: number[]
  value: number
  onChange: (value: number) => void
  render?: (option: number) => string
  showLabel?: boolean
}

export function Dropdown({ label, options, value, onChange, render = String, showLabel = true }: DropdownProps) {
  return (
    <label className="flex shrink-0 items-center gap-2">
      {showLabel && <span className="label hidden md:inline">{label}</span>}
      <span className="relative">
        <select
          aria-label={label}
          value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="cursor-pointer appearance-none rounded bg-surface-2 py-2 pl-3 pr-8 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-accent/30"
        >
          {options.map(o => <option key={o} value={o}>{render(o)}</option>)}
        </select>
        <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
          <path d="m6 9 6 6 6-6" />
        </svg>
      </span>
    </label>
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

// ▲n in green for gains, ▼n in red for losses, a muted dash for no change
export function Delta({ value, title }: { value: number; title: string }) {
  if (value === 0) return <span className="text-xs text-muted/60" title={title}>–</span>
  return (
    <span className={`text-xs font-semibold tabular-nums ${value > 0 ? 'text-up' : 'text-down'}`} title={title}>
      {value > 0 ? '▲' : '▼'}{Math.abs(value)}
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
