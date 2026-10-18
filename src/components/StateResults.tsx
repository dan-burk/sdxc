import { useMemo, useState } from 'react'
import { getStateResults } from '../data'
import { formatTime, titleCase } from '../format'
import { useAsync } from '../hooks'
import type { Gender, StateFinisher } from '../types'
import type { ClassFilter } from './FilterBar'
import { PredictionError, StateTeams, type StateMeet } from './StateTeams'
import { ClassBadge, Delta, ErrorCard } from './ui'

const RACE_ORDER = { AA: 0, A: 1, B: 2 }
const TOP = 25 // finishers shown per race until "Show all"
// Actual place once results are in, predicted place before
const order = (r: StateFinisher) => r.place ?? r.predicted ?? Infinity
const MEDAL = ['bg-gold', 'bg-silver', 'bg-bronze']
const COLUMNS: { label: string; short?: string; className?: string }[] = [
  { label: 'Place', className: 'w-14 sm:w-20' },
  { label: 'Predicted', short: 'Pred', className: 'sm:w-24' },
  { label: 'Runner' },
  { label: 'School', className: 'hidden sm:table-cell' },
  { label: 'Race', className: 'hidden sm:table-cell' },
  { label: 'Time' },
  { label: 'State Rank', className: 'hidden md:table-cell text-right' },
]

interface Props {
  gender: Gender
  year: number
  week: number
  cls: ClassFilter
  stateMeets: StateMeet[]
}

export function StateResults({ gender, year, week, cls, stateMeets }: Props) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const { data, loading, error, retry } = useAsync(() => getStateResults(gender, year, week), [gender, year, week])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (data ?? [])
      .filter(r =>
        (cls === 'All' || r.race === cls) &&
        (!q || r.Name.toLowerCase().includes(q) || r.School.toLowerCase().includes(q)))
      .sort((a, b) => RACE_ORDER[a.race] - RACE_ORDER[b.race] || order(a) - order(b))
  }, [data, search, cls])

  // A search shows every match; otherwise the top 25 in each race
  const shown = showAll || search.trim() ? rows : rows.filter(r => order(r) <= TOP)
  // Before the meet every place is null and the page shows predictions only
  const preMeet = !!data?.length && data.every(r => r.place === null)

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h1 className="font-display text-3xl font-semibold sm:text-4xl">
          {gender === 'boys' ? 'Boys' : 'Girls'} · {year} · State Meet
          {preMeet && <span className="ml-3 rounded-full bg-accent/10 px-2.5 py-1 align-middle font-sans text-xs font-semibold uppercase tracking-[0.08em] text-accent">Predicted</span>}
        </h1>
        <label className="relative sm:w-72">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search runner or school"
            className="w-full rounded border border-border bg-surface py-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
        </label>
      </div>

      <h2 className="font-display text-xl font-semibold">Teams</h2>
      <div className="grid items-start gap-4 lg:grid-cols-[1.1fr_1fr]">
        <StateTeams gender={gender} year={year} cls={cls} search={search} />
        <PredictionError gender={gender} year={year} cls={cls} stateMeets={stateMeets} />
      </div>

      <h2 className="font-display text-xl font-semibold">Individuals</h2>

      {error && <ErrorCard message={`Couldn't load the ${year} ${gender} state meet results.`} onRetry={retry} />}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              {COLUMNS.map(c => (
                <th key={c.label} className={`label px-2 py-3 text-left sm:px-4 ${c.className ?? ''}`}>
                  <span className="sm:hidden">{c.short ?? c.label}</span>
                  <span className="hidden sm:inline">{c.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading && Array.from({ length: 8 }, (_, i) => (
              <tr key={i}>
                <td colSpan={COLUMNS.length} className="px-4 py-4">
                  <div className="h-3 animate-pulse rounded bg-surface-2" style={{ width: `${90 - i * 6}%` }} />
                </td>
              </tr>
            ))}
            {!loading && data && rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-muted">
                  No finishers match{search && ` “${search}”`}{cls !== 'All' && ` in the Class ${cls} race`}.{' '}
                  {search && <button onClick={() => setSearch('')} className="font-semibold text-accent hover:underline">Clear search</button>}
                </td>
              </tr>
            )}
            {!loading && shown.map(r => {
              const diff = r.predicted === null || r.place === null ? null : r.predicted - r.place
              return (
                <tr key={r.id} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-2 py-2.5 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${r.place ? MEDAL[r.place - 1] ?? '' : ''}`} />
                      <span className="w-7 text-right font-display text-lg font-semibold tabular-nums">{r.place ?? <span className="text-muted">—</span>}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2.5 sm:px-4">
                    {r.predicted === null ? <span className="text-muted">—</span> : (
                      <div className="flex items-center gap-2">
                        <span className={`w-7 text-right tabular-nums ${r.place === null ? 'font-semibold' : 'text-muted'}`}>{r.predicted}</span>
                        {diff !== null && <Delta
                          value={diff}
                          title={diff === 0 ? 'Finished exactly as predicted' : diff > 0 ? `Beat the prediction by ${diff}` : `${-diff} behind the prediction`}
                        />}
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2.5 sm:px-4">
                    <div className="font-medium">{titleCase(r.Name)}</div>
                    <div className="text-xs text-muted sm:hidden">{r.School} · {r.race}</div>
                  </td>
                  <td className="hidden px-3 py-2.5 sm:table-cell sm:px-4">{r.School}</td>
                  <td className="hidden px-3 py-2.5 sm:table-cell sm:px-4"><ClassBadge cls={r.race} /></td>
                  <td className="px-3 py-2.5 tabular-nums sm:px-4">{formatTime(r.state_time)}</td>
                  <td className="hidden px-3 py-2.5 text-right tabular-nums text-muted md:table-cell">
                    {r.rnk_blnd === null ? '—' : `#${r.rnk_blnd}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && !search.trim() && (showAll || rows.length > shown.length) ? (
          <button onClick={() => setShowAll(s => !s)} className="w-full border-t border-border py-2.5 text-sm font-semibold text-accent hover:bg-surface-2/60">
            {showAll ? `Show top ${TOP}` : `Show all ${rows.length.toLocaleString()}${cls === 'All' ? '' : ` Class ${cls}`} ${preMeet ? 'runners' : 'finishers'}`}
          </button>
        ) : null}
      </div>
    </section>
  )
}
