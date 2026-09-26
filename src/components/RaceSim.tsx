import { useMemo, useState } from 'react'
import { getRankings, getSchools } from '../data'
import { formatTime, titleCase } from '../format'
import { useAsync } from '../hooks'
import { LIMITS, simulateRace } from '../scoring'
import type { Gender, Runner, School, SchoolClass } from '../types'
import { ClassBadge, ErrorCard, Segmented } from './ui'

const CLASSES: SchoolClass[] = ['B', 'A', 'AA']
const NO_SCHOOLS: School[] = []
const NO_RUNNERS: Runner[] = []
const TEAM_HUES = [224, 162, 32, 340, 268, 190, 88, 8, 300, 128]
const teamColor = (i: number) => `hsl(${TEAM_HUES[i % TEAM_HUES.length]} 70% 52%)`

interface Props {
  gender: Gender
  year: number
  week: number
  selected: string[]
  onSelected: (schools: string[]) => void
}

export function RaceSim({ gender, year, week, selected, onSelected }: Props) {
  const [query, setQuery] = useState('')
  const [override, setOverride] = useState<SchoolClass | null>(null)
  const { data, loading, error, retry } = useAsync(
    () => Promise.all([getSchools(year), getRankings(gender, year, week)]),
    [gender, year, week],
  )
  const schools = data?.[0] ?? NO_SCHOOLS
  const runners = data?.[1] ?? NO_RUNNERS

  const classOf = useMemo(() => new Map(schools.map(s => [s.School, s.school_class])), [schools])
  // Drop picks that don't exist this year (classes and co-ops change year to year)
  const active = useMemo(() => selected.filter(s => classOf.has(s)), [selected, classOf])
  const color = new Map(active.map((s, i) => [s, teamColor(i)]))

  // Default scoring class: the most common class among the picked schools
  const autoCls = useMemo(() => {
    const counts = new Map<SchoolClass, number>()
    for (const s of active) counts.set(classOf.get(s)!, (counts.get(classOf.get(s)!) ?? 0) + 1)
    return [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'AA'
  }, [active, classOf])
  const cls = override ?? autoCls
  const { score, run } = LIMITS[cls]

  const result = useMemo(() => simulateRace(runners, active, cls), [runners, active, cls])
  const q = query.trim().toLowerCase()
  const options = schools.filter(s => !active.includes(s.School) && s.School.toLowerCase().includes(q))
  const add = (names: string[]) => onSelected([...active, ...names.filter(n => !active.includes(n))])
  const remove = (name: string) => onSelected(active.filter(s => s !== name))
  // 1A–5A then 1B–5B; empty until schools_{year}.json carries regions
  const regions = [...new Set(schools.map(s => s.region).filter((r): r is string => !!r))]
    .sort((a, b) => a.slice(-1).localeCompare(b.slice(-1)) || a.localeCompare(b))
  const loadRegion = (region: string) => {
    onSelected(schools.filter(s => s.region === region).map(s => s.School))
    setOverride(null) // the auto-picked class matches the region's class
  }
  const genderLabel = gender === 'boys' ? 'Boys' : 'Girls'

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <aside className="card space-y-5 self-start p-4 sm:p-5 lg:sticky lg:top-32">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Schools</h2>
            {active.length > 0 && (
              <button onClick={() => onSelected([])} className="text-xs font-semibold text-muted hover:text-down">Clear all</button>
            )}
          </div>
          {active.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {active.map(s => (
                <button
                  key={s}
                  onClick={() => remove(s)}
                  className="group inline-flex items-center gap-1.5 rounded-full bg-accent-soft py-1 pl-2.5 pr-2 text-xs font-medium text-accent"
                  aria-label={`Remove ${s}`}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: color.get(s) }} />
                  {s}
                  <span className="opacity-60 group-hover:opacity-100">×</span>
                </button>
              ))}
            </div>
          )}
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && q && options[0]) {
                add([options[0].School])
                setQuery('')
              }
            }}
            placeholder="Search schools"
            className="w-full rounded border border-border bg-surface px-3 py-2 text-sm outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <ul className="max-h-64 overflow-y-auto rounded border border-border">
            {options.map((s, i) => (
              <li key={s.School}>
                <button
                  onClick={() => add([s.School])}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-surface-2 ${q && i === 0 ? 'bg-surface-2' : ''}`}
                >
                  {s.School}
                  <ClassBadge cls={s.school_class} />
                </button>
              </li>
            ))}
            {options.length === 0 && <li className="px-3 py-4 text-center text-sm text-muted">No schools match</li>}
          </ul>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
            {(['AA', 'A', 'B'] as SchoolClass[]).map(c => (
              <button
                key={c}
                onClick={() => add(schools.filter(s => s.school_class === c).map(s => s.School))}
                className="font-semibold text-accent hover:underline"
              >
                + All Class {c}
              </button>
            ))}
          </div>
          {regions.length > 0 && (
            <div className="relative">
              <select
                aria-label="Simulate a region"
                value=""
                onChange={e => loadRegion(e.target.value)}
                className="w-full cursor-pointer appearance-none rounded bg-surface-2 py-2 pl-3 pr-8 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="" disabled>Simulate a region…</option>
                {regions.map(r => <option key={r} value={r}>Region {r}</option>)}
              </select>
              <svg className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-xl font-semibold">Scoring</h2>
          <div className="[&>div>div]:w-full [&>div]:w-full [&_button]:flex-1">
            <Segmented
              label="Scoring class"
              showLabel={false}
              options={CLASSES}
              value={cls}
              onChange={setOverride}
              render={c => (
                <span className="flex flex-col leading-tight">
                  {c}
                  <span className="text-[10px] font-normal text-muted">{LIMITS[c].score} score · {LIMITS[c].run} run</span>
                </span>
              )}
            />
          </div>
          <p className="text-xs text-muted">
            {override ? (
              <button onClick={() => setOverride(null)} className="font-semibold text-accent hover:underline">Reset to auto</button>
            ) : active.length > 0 ? `Auto-picked from the selected schools.` : 'Picks itself from the schools you add.'}
          </p>
        </div>
      </aside>

      <section className="space-y-4">
        <div>
          <h1 className="font-display text-3xl font-semibold sm:text-4xl">{genderLabel} · {year} · Week {week}</h1>
          <p className="text-sm text-muted">
            Projected meet from week {week} rankings · Class {cls} scoring
          </p>
        </div>

        {error && <ErrorCard message={`Couldn't load ${year} week ${week} data.`} onRetry={retry} />}

        {loading ? (
          <div className="card h-64 animate-pulse bg-surface-2/50" />
        ) : active.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-border px-6 py-16 text-center text-muted">
            Pick two or more schools to simulate a meet.
          </div>
        ) : (
          <>
            <div className="card overflow-hidden">
              <div className="flex items-baseline justify-between px-4 pt-4 sm:px-5">
                <h2 className="font-display text-xl font-semibold">Team standings</h2>
                <span className="label">Lowest score wins</span>
              </div>
              <table className="mt-3 w-full text-sm">
                <thead className="bg-surface-2">
                  <tr>
                    <th className="label w-12 px-4 py-2 text-left sm:px-5">#</th>
                    <th className="label px-2 py-2 text-left">School</th>
                    <th className="label px-2 py-2 text-right">Score</th>
                    <th className="label hidden px-4 py-2 text-left sm:table-cell sm:px-5">Places</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {result.standings.map((t, i) => (
                    <tr key={t.school} className={t.complete ? (i === 0 ? 'shadow-[inset_3px_0_0_rgb(var(--accent))]' : '') : 'opacity-60'}>
                      <td className="px-4 py-3 font-display text-lg font-semibold tabular-nums sm:px-5">{t.complete ? i + 1 : '—'}</td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2 font-medium">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: color.get(t.school) }} />
                          {t.school}
                        </div>
                      </td>
                      <td className="px-2 py-3 text-right">
                        {t.complete ? (
                          <>
                            <div className="font-display text-3xl font-bold leading-none tabular-nums">{t.score}</div>
                            {t.tied && <div className="text-[11px] text-muted">tiebreak: next runner</div>}
                          </>
                        ) : (
                          <div className="text-xs text-muted">Incomplete · {t.entrants} of {score}</div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell sm:px-5">
                        <div className="flex flex-wrap gap-1">
                          {t.scorers.map(p => <span key={p} className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-semibold tabular-nums">{p}</span>)}
                          {t.displacers.map(p => <span key={p} className="rounded border border-border px-1.5 py-0.5 text-xs tabular-nums text-muted">{p}</span>)}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="border-t border-border px-4 py-3 text-xs text-muted sm:px-5">
                Class {cls}: top {score} score, runners {score + 1}–{run} displace (outlined). Runners on incomplete teams place but don't take team places.
              </p>
            </div>

            <div className="card overflow-hidden">
              <h2 className="px-4 pt-4 font-display text-xl font-semibold sm:px-5">Projected finish</h2>
              <ol className="mt-3 divide-y divide-border text-sm">
                {result.finishers.map(f => (
                  <li key={f.runner.rnk_blnd} className="flex items-center gap-3 px-4 py-2.5 sm:px-5">
                    <span className="w-8 text-right font-display text-lg font-semibold tabular-nums">{f.place}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium">{titleCase(f.runner.Name)}</div>
                      <div className="flex items-center gap-1.5 text-xs text-muted">
                        <span className="h-2 w-2 rounded-full" style={{ background: color.get(f.runner.School) }} />
                        {f.runner.School} · #{f.runner.rnk_blnd} overall
                      </div>
                    </div>
                    <span className={`tabular-nums ${f.runner.time_min === null ? 'text-muted' : ''}`}>{formatTime(f.runner.time_min)}</span>
                    <span
                      className={`w-16 text-right text-xs tabular-nums ${f.role === 'scorer' ? 'font-semibold' : 'text-muted'}`}
                      title={f.role ? `Team place ${f.teamPlace} (${f.role})` : 'Team did not score'}
                    >
                      {f.teamPlace === null ? '—' : `T${f.teamPlace}`}
                      {f.role === 'displacer' && <span className="ml-1 text-[10px]">disp</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
