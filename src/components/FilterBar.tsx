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
        <Segmented label="Year" options={p.years} value={p.year} onChange={p.onYear} />
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
