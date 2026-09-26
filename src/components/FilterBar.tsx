import type { Gender, SchoolClass } from '../types'
import { Dropdown, Segmented } from './ui'

export type ClassFilter = SchoolClass | 'All'

interface Props {
  years: number[]
  year: number
  onYear: (year: number) => void
  latestWeek: number
  stateWeek?: number
  week: number
  onWeek: (week: number) => void
  gender: Gender
  onGender: (gender: Gender) => void
  cls?: ClassFilter // omitted on the simulator, which has its own scoring class
  onCls?: (cls: ClassFilter) => void
}

export function FilterBar(p: Props) {
  // Newest first in both dropdowns
  const weeks = Array.from({ length: p.latestWeek }, (_, i) => p.latestWeek - i)
  return (
    <div className="border-b border-border bg-bg/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl snap-x items-center gap-5 overflow-x-auto px-4 py-2.5 sm:px-6">
        <Dropdown label="Year" options={[...p.years].reverse()} value={p.year} onChange={p.onYear} />
        <Dropdown label="Week" options={weeks} value={p.week} onChange={p.onWeek} render={w => (w === p.stateWeek ? 'State Meet' : `Week ${w}`)} showLabel={false} />
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
