import { useState } from 'react'
import { getStateResults, getStateTeams } from '../data'
import { useAsync } from '../hooks'
import { simulateRace } from '../scoring'
import type { Gender, Runner, SchoolClass, StateFinisher, StateTeam } from '../types'
import type { ClassFilter } from './FilterBar'
import { ClassBadge, Delta, ErrorCard } from './ui'

const RACES: SchoolClass[] = ['AA', 'A', 'B']
const MEDAL = ['bg-gold', 'bg-silver', 'bg-bronze']
const TOP = 8

export interface StateMeet {
  year: number
  week: number
}

interface TeamsProps {
  gender: Gender
  year: number
  cls: ClassFilter
  search: string
  finishers?: StateFinisher[] // the state meet file, already loaded by StateResults
}

// Simulated meet: score a race's entrants in their predicted order, as the race simulator does
function simulate(finishers: StateFinisher[], race: SchoolClass) {
  const entrants = finishers.filter(r => r.race === race)
  // Runners with no prediction go last
  const runners = entrants.map((r, i) => ({ ...r, rnk_blnd: r.predicted ?? entrants.length + i })) as unknown as Runner[]
  const { standings } = simulateRace(runners, [...new Set(entrants.map(r => r.School))], race)
  return new Map(standings.map(t => [t.school, t]))
}
type Simulated = ReturnType<typeof simulate>

// Team places at state, one card per race shown
export function StateTeams({ gender, year, cls, search, finishers }: TeamsProps) {
  const { data, loading, error, retry } = useAsync(() => getStateTeams(gender, year), [gender, year])
  if (error) return <ErrorCard message={`Couldn't load the ${year} ${gender} state team results.`} onRetry={retry} />
  if (loading || !data || !finishers) return <div className="card h-48 animate-pulse" />

  const races = RACES.filter(r => cls === 'All' || r === cls)
  return (
    <div className="min-w-0 space-y-4">
      {races.map(race => (
        <TeamCard
          key={`${gender}-${year}-${race}`}
          race={race}
          showClass={races.length > 1}
          teams={data.filter(t => t.race === race)}
          sim={simulate(finishers, race)}
          search={search.trim().toLowerCase()}
        />
      ))}
    </div>
  )
}

function TeamCard({ race, showClass, teams: unsorted, sim, search }: { race: SchoolClass; showClass: boolean; teams: StateTeam[]; sim: Simulated; search: string }) {
  const [showAll, setShowAll] = useState(false)
  if (!unsorted.length) return null
  // Actual order once results are in, predicted order before. Predicted rank comes from the file;
  // the simulation only supplies predicted score and places
  const teams = [...unsorted].sort((a, b) => (a.place ?? a.predicted) - (b.place ?? b.predicted))
  // A search shows every matching team; otherwise the top 8
  const matches = search ? teams.filter(t => t.School.toLowerCase().includes(search)) : teams
  const shown = showAll || search ? matches : matches.slice(0, TOP)

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 font-display text-lg font-semibold">
        {showClass && <ClassBadge cls={race} />}
        {teams.length} Teams
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-2">
            <tr>
              <th className="label w-16 px-2 py-2.5 text-left sm:px-4">Place</th>
              <th className="label w-20 px-2 py-2.5 text-left">Pred</th>
              <th className="label px-2 py-2.5 text-left">Team</th>
              <th className="label px-2 py-2.5 text-left">Places</th>
              <th className="label px-2 py-2.5 text-right">Pred Score</th>
              <th className="label px-2 py-2.5 text-right sm:px-4">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map(t => {
              const s = sim.get(t.School)
              const diff = t.place === null ? null : t.predicted - t.place
              const scorers = t.scorers ?? s?.scorers, displacers = t.displacers ?? s?.displacers
              return (
                <tr key={t.School} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-2 py-2 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.place ? MEDAL[t.place - 1] ?? '' : ''}`} />
                      <span className="w-6 text-right font-display text-lg font-semibold tabular-nums">{t.place ?? <span className="text-muted">—</span>}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 text-right tabular-nums ${diff === null ? 'font-semibold' : 'text-muted'}`}>{t.predicted}</span>
                      {diff !== null && <Delta value={diff} title={diff === 0 ? 'Finished exactly as predicted' : diff > 0 ? `Beat the prediction by ${diff}` : `${-diff} behind the prediction`} />}
                    </div>
                  </td>
                  <td className="px-2 py-2 font-medium">{t.School}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs tabular-nums text-muted">
                    {scorers?.join('-')}
                    {!!displacers?.length && <span title="Displacers"> ({displacers.join(', ')})</span>}
                  </td>
                  <td className="px-2 py-2 text-right tabular-nums text-muted">{s?.score ?? '—'}</td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums sm:px-4">{t.score ?? <span className="text-muted">—</span>}</td>
                </tr>
              )
            })}
            {shown.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted">No teams match.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {!search && teams.length > TOP && (
        <button onClick={() => setShowAll(s => !s)} className="w-full border-t border-border py-2.5 text-sm font-semibold text-accent hover:bg-surface-2/60">
          {showAll ? `Show top ${TOP}` : `Show all ${teams.length} teams`}
        </button>
      )}
    </div>
  )
}

interface ErrorProps {
  gender: Gender
  year: number
  cls: ClassFilter
  stateMeets: StateMeet[] // up to `year`, oldest first
}

// Mean |predicted - place| over the rows that have a prediction
function mae<T extends { place: number | null }>(rows: T[], predicted: (r: T) => number | null) {
  const errors = rows.flatMap(r => {
    const p = predicted(r)
    return p === null || r.place === null ? [] : [Math.abs(p - r.place)]
  })
  return errors.length ? errors.reduce((s, e) => s + e, 0) / errors.length : null
}

const fmt = (v: number | null) => (v === null ? '—' : v.toFixed(1))

// Individual and team MAE for each state meet so far, Time vs Adj
export function PredictionError({ gender, year, cls, stateMeets }: ErrorProps) {
  const { data, loading, error, retry } = useAsync(
    () => Promise.all(stateMeets.map(m => Promise.all([getStateResults(gender, m.year, m.week), getStateTeams(gender, m.year)]))),
    [gender, stateMeets.map(m => m.year).join()],
  )
  if (error) return <ErrorCard message={`Couldn't load the ${gender} state meet history.`} onRetry={retry} />
  if (loading || !data) return <div className="card h-48 animate-pulse" />

  const inRace = (r: { race: SchoolClass }) => cls === 'All' || r.race === cls
  const rows = stateMeets.map((m, i) => {
    const [finishers, teams] = data[i] as [StateFinisher[], StateTeam[]]
    const runners = finishers.filter(inRace), races = teams.filter(inRace)
    return {
      year: m.year,
      indTime: mae(runners, r => r.predicted_pr),
      indAdj: mae(runners, r => r.predicted),
      teamTime: mae(races, t => t.predicted_pr),
      teamAdj: mae(races, t => t.predicted),
    }
  })
  // Before this year's meet, the bullets fall back to the last meet with results
  const current = rows.find(r => r.year === year)
  const latest = [...rows].reverse().find(r => r.indAdj !== null)

  // Green marks the better metric on this year's row
  const cell = (v: number | null, other: number | null, isCurrent: boolean, divider = false) => (
    <td className={`px-3 py-2 text-right tabular-nums ${divider ? 'border-l border-border' : ''} ${
      isCurrent && v !== null && other !== null && v < other ? 'text-up' : ''}`}>
      {fmt(v)}
    </td>
  )

  return (
    <div className="card min-w-0 overflow-hidden">
      <div className="flex items-baseline justify-between gap-3 px-4 py-3">
        <span className="label">Prediction Error</span>
        <span className="text-xs text-muted">Mean Absolute Error (MAE)</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead className="bg-surface-2">
            <tr>
              <th rowSpan={2} className="label px-3 py-2 text-left sm:px-4">State meet</th>
              <th colSpan={2} className="label border-l border-border px-3 pt-2 text-center">Individual</th>
              <th colSpan={2} className="label border-l border-border px-3 pt-2 text-center">Team</th>
            </tr>
            <tr>
              <th className="label border-l border-border px-3 pb-2 text-right">Time</th>
              <th className="label px-3 pb-2 text-right">Adj</th>
              <th className="label border-l border-border px-3 pb-2 text-right">Time</th>
              <th className="label px-3 pb-2 text-right">Adj</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map(r => {
              const isCurrent = r.year === year
              return (
                <tr key={r.year} className={isCurrent ? 'font-semibold' : 'text-xs text-muted'}>
                  <td className="px-3 py-2 sm:px-4">{r.year}</td>
                  {cell(r.indTime, r.indAdj, isCurrent, true)}
                  {cell(r.indAdj, r.indTime, isCurrent)}
                  {cell(r.teamTime, r.teamAdj, isCurrent, true)}
                  {cell(r.teamAdj, r.teamTime, isCurrent)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {latest && (
        <ul className="list-disc space-y-1 border-t border-border py-3 pl-8 pr-4 text-xs text-muted">
          {latest !== current && <li>{year} fills in after the meet. Last year ({latest.year}):</li>}
          {latest.indTime !== null && (
            <li>Ranking on Time: runners finished on average within <b className="text-text">{fmt(latest.indTime)}</b> places of their predicted finish.</li>
          )}
          {latest.indAdj !== null && (
            <li>Ranking on Adjusted Time: runners finished on average within <b className="text-text">{fmt(latest.indAdj)}</b> places of their predicted finish.</li>
          )}
        </ul>
      )}
    </div>
  )
}
