import type { Gender, SchoolClass } from '../types'
import { Segmented } from './ui'

export type ClassFilter = SchoolClass | 'All'

interface Props {
  years: number[]
  year: number
  onYear: (year: number) => void
  latestWeek: number
  week: number
  onWeek: (week: number) => void
  gender: Gender
  onGender: (gender: Gender) => void
  cls?: ClassFilter // omitted on the simulator, which has its own scoring class
  onCls?: (cls: ClassFilter) => void
}

export function FilterBar(p: Props) {
  const weeks = Array.from({ length: p.latestWeek }, (_, i) => i + 1)
  return (
    <div className="border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl snap-x items-center gap-5 overflow-x-auto px-4 py-2.5 sm:px-6">
        <label className="flex shrink-0 items-center gap-2">
          <span className="label hidden md:inline">Year</span>
          <span className="relative">
            <select
              aria-label="Year"
              value={p.year}
              onChange={e => p.onYear(Number(e.target.value))}
              className="cursor-pointer appearance-none rounded bg-surface-2 py-2 pl-3 pr-8 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-accent/30"
            >
              {[...p.years].reverse().map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </label>
        <Segmented
          label="Week"
          options={weeks}
          value={p.week}
          onChange={p.onWeek}
          render={w => (
            <>
              <span className="md:hidden">W</span>{w}
              {w === p.latestWeek && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-accent" />}
            </>
          )}
        />
        <Segmented
          label="Gender"
          options={['boys', 'girls'] as Gender[]}
          value={p.gender}
          onChange={p.onGender}
          render={g => (g === 'boys' ? 'Boys' : 'Girls')}
        />
        {p.cls && p.onCls && (
          <Segmented label="Class" options={['All', 'AA', 'A', 'B'] as ClassFilter[]} value={p.cls} onChange={p.onCls} />
        )}
      </div>
    </div>
  )
}
