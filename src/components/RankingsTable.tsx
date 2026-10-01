import { useMemo, useState } from 'react'
import { getRankings } from '../data'
import { formatPoints, formatTime, titleCase } from '../format'
import { useAsync } from '../hooks'
import type { Gender, Runner } from '../types'
import type { ClassFilter } from './FilterBar'
import { ClassBadge, Delta, ErrorCard } from './ui'

type SortKey = 'rank' | 'name' | 'school' | 'class' | 'time' | 'score'
type Move = number | 'new' | null // null when there's no previous week to compare

const CLASS_ORDER = { AA: 0, A: 1, B: 2 }
const COMPARE: Record<SortKey, (a: Runner, b: Runner) => number> = {
  rank: (a, b) => a.rnk_blnd - b.rnk_blnd,
  name: (a, b) => a.Name.localeCompare(b.Name),
  school: (a, b) => a.School.localeCompare(b.School),
  class: (a, b) => CLASS_ORDER[a.school_class] - CLASS_ORDER[b.school_class],
  time: (a, b) => (a.time_min ?? 0) - (b.time_min ?? 0),
  // Best first when ascending: lowest adjusted time, or most points in 2023's files
  score: (a, b) => (a.adj_time !== undefined ? a.adj_time - b.adj_time! : b.points! - a.points!),
}
const COLUMNS: { key: SortKey; label: string; className?: string }[] = [
  { key: 'rank', label: 'Rank', className: 'w-24 sm:w-28' },
  { key: 'name', label: 'Runner' },
  { key: 'school', label: 'School', className: 'hidden sm:table-cell' },
  { key: 'class', label: 'Class', className: 'hidden sm:table-cell' },
  { key: 'time', label: '5K' },
  { key: 'score', label: 'Adjusted', className: 'hidden md:table-cell text-right' },
]
const MEDAL = ['bg-gold', 'bg-silver', 'bg-bronze']

function Movement({ move, prevWeek }: { move: Move; prevWeek: number }) {
  if (move === null) return null
  if (move === 'new') return <span className="text-[10px] font-semibold tracking-wide text-accent">NEW</span>
  const title = move === 0 ? `No change from week ${prevWeek}` : `${move > 0 ? 'Up' : 'Down'} ${Math.abs(move)} from week ${prevWeek}`
  return <Delta value={move} title={title} />
}

interface Props {
  gender: Gender
  year: number
  week: number
  cls: ClassFilter
}

export function RankingsTable({ gender, year, week, cls }: Props) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'rank', dir: 'asc' })
  const { data, loading, error, retry } = useAsync(
    () => Promise.all([
      getRankings(gender, year, week),
      week > 1 ? getRankings(gender, year, week - 1).catch(() => null) : null, // arrows are optional
    ]),
    [gender, year, week],
  )

  // Rank within class = position among that class's runners in the overall order
  const classRanks = useMemo(() => {
    const counts = { AA: 0, A: 0, B: 0 }
    const ranks = new Map<number, number>()
    for (const r of [...(data?.[0] ?? [])].sort((a, b) => a.rnk_blnd - b.rnk_blnd)) {
      ranks.set(r.rnk_blnd, ++counts[r.school_class])
    }
    return ranks
  }, [data])

  const moves = useMemo(() => {
    const prev = data?.[1] && new Map(data[1].map(r => [r.id, r.rnk_blnd]))
    return (r: Runner): Move => {
      if (!prev) return null
      const before = prev.get(r.id)
      return before === undefined ? 'new' : before - r.rnk_blnd
    }
  }, [data])

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = (data?.[0] ?? []).filter(r =>
      (cls === 'All' || r.school_class === cls) &&
      (!q || r.Name.toLowerCase().includes(q) || r.School.toLowerCase().includes(q)),
    )
    return filtered.sort((a, b) => {
      // Missing times sort last in both directions
      if (sort.key === 'time' && (a.time_min === null) !== (b.time_min === null)) return a.time_min === null ? 1 : -1
      const d = COMPARE[sort.key](a, b)
      return (sort.dir === 'asc' ? d : -d) || a.rnk_blnd - b.rnk_blnd
    })
  }, [data, search, cls, sort])

  const onSort = (key: SortKey) =>
    setSort(s => s.key === key
      ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' }
      : { key, dir: 'asc' })

  const genderLabel = gender === 'boys' ? 'Boys' : 'Girls'
  // 2025 on ranks by course-adjusted time; 2023's files still carry the old points
  const adjusted = data?.[0][0]?.adj_time !== undefined
  const score = (r: Runner) => (adjusted ? formatTime(r.adj_time!) : formatPoints(r.points!))

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">
            {genderLabel} · {year} · Week {week}
          </h1>
          <p className="text-sm text-muted">
            {data ? `${rows.length.toLocaleString()} runners${cls === 'All' ? '' : ` in Class ${cls}`}` : ' '}
            {data?.[1] && <> · <span className="text-up">▲</span><span className="text-down">▼</span> from week {week - 1}</>}
          </p>
        </div>
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

      {error && <ErrorCard message={`Couldn't load ${year} week ${week} ${gender} rankings.`} onRetry={retry} />}

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              {COLUMNS.map(c => (
                <th key={c.key} className={`label px-3 py-3 text-left sm:px-4 ${c.className ?? ''}`}>
                  <button onClick={() => onSort(c.key)} className={`inline-flex items-center gap-1 uppercase hover:text-text ${sort.key === c.key ? 'text-text' : ''}`}>
                    {c.key === 'score' && !adjusted ? 'Points' : c.label}
                    {sort.key === c.key && <span aria-hidden>{sort.dir === 'asc' ? '↑' : '↓'}</span>}
                  </button>
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
                  No runners match{search && ` “${search}”`}{cls !== 'All' && ` in Class ${cls}`}.{' '}
                  {search && <button onClick={() => setSearch('')} className="font-semibold text-accent hover:underline">Clear search</button>}
                </td>
              </tr>
            )}
            {!loading && rows.map(r => (
              <tr key={r.rnk_blnd} className="transition-colors hover:bg-surface-2/60">
                <td className="px-3 py-2.5 sm:px-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${MEDAL[(cls === 'All' ? r.rnk_blnd : classRanks.get(r.rnk_blnd)!) - 1] ?? ''}`} />
                    <span className="w-9 text-right font-display text-lg font-semibold tabular-nums">
                      {cls === 'All' ? r.rnk_blnd : classRanks.get(r.rnk_blnd)}
                    </span>
                    {cls === 'All' && <span className="w-9"><Movement move={moves(r)} prevWeek={week - 1} /></span>}
                  </div>
                  {/* Filtered to a class: class rank is the big number, the statewide rank and its movement go underneath */}
                  {cls !== 'All' && (
                    <div className="flex items-center gap-1 whitespace-nowrap pl-3.5 text-[10px] leading-none text-muted tabular-nums [&_span]:text-[10px]">
                      State #{r.rnk_blnd}
                      <Movement move={moves(r)} prevWeek={week - 1} />
                    </div>
                  )}
                </td>
                <td className="px-3 py-2.5 sm:px-4">
                  <div className="font-medium">{titleCase(r.Name)}</div>
                  <div className="text-xs text-muted sm:hidden">{r.School} · {r.school_class}</div>
                </td>
                <td className="hidden px-3 py-2.5 sm:px-4 sm:table-cell">{r.School}</td>
                <td className="hidden px-3 py-2.5 sm:px-4 sm:table-cell"><ClassBadge cls={r.school_class} /></td>
                <td className="px-3 py-2.5 tabular-nums sm:px-4">
                  <div className={r.time_min === null ? 'text-muted' : ''}>{formatTime(r.time_min)}</div>
                  <div className="whitespace-nowrap text-xs text-muted md:hidden">{score(r)} {adjusted ? 'adj' : 'pts'}</div>
                </td>
                <td className="hidden px-3 py-2.5 sm:px-4 text-right tabular-nums text-muted md:table-cell">{score(r)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
