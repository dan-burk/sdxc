import { useState } from 'react'
import { getStateResults, getStateTeams } from '../data'
import { useAsync } from '../hooks'
import type { Gender, SchoolClass, StateFinisher, StateTeam } from '../types'
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
}

// Team places at state, one card per race shown
export function StateTeams({ gender, year, cls, search }: TeamsProps) {
  const { data, loading, error, retry } = useAsync(() => getStateTeams(gender, year), [gender, year])
  if (error) return <ErrorCard message={`Couldn't load the ${year} ${gender} state team results.`} onRetry={retry} />
  if (loading || !data) return <div className="card h-48 animate-pulse" />

  const races = RACES.filter(r => cls === 'All' || r === cls)
  return (
    <div className="min-w-0 space-y-4">
      {races.map(race => (
        <TeamCard
          key={`${gender}-${year}-${race}`}
          race={race}
          showClass={races.length > 1}
          teams={data.filter(t => t.race === race).sort((a, b) => a.place - b.place)}
          search={search.trim().toLowerCase()}
        />
      ))}
    </div>
  )
}

function TeamCard({ race, showClass, teams, search }: { race: SchoolClass; showClass: boolean; teams: StateTeam[]; search: string }) {
  const [showAll, setShowAll] = useState(false)
  if (!teams.length) return null
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
              <th className="label px-2 py-2.5 text-right sm:px-4">Score</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {shown.map(t => {
              const diff = t.predicted - t.place
              return (
                <tr key={t.School} className="transition-colors hover:bg-surface-2/60">
                  <td className="px-2 py-2 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${MEDAL[t.place - 1] ?? ''}`} />
                      <span className="w-6 text-right font-display text-lg font-semibold tabular-nums">{t.place}</span>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-right tabular-nums text-muted">{t.predicted}</span>
                      <Delta value={diff} title={diff === 0 ? 'Finished exactly as predicted' : diff > 0 ? `Beat the prediction by ${diff}` : `${-diff} behind the prediction`} />
                    </div>
                  </td>
                  <td className="px-2 py-2 font-medium">{t.School}</td>
                  <td className="whitespace-nowrap px-2 py-2 text-xs tabular-nums text-muted">
                    {t.scorers.join('-')}
                    {t.displacers.length > 0 && <span title="Displacers"> ({t.displacers.join(', ')})</span>}
                  </td>
                  <td className="px-2 py-2 text-right font-semibold tabular-nums sm:px-4">{t.score}</td>
                </tr>
              )
            })}
            {shown.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted">No teams match.</td></tr>
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
function mae<T extends { place: number }>(rows: T[], predicted: (r: T) => number | null | undefined) {
  const errors = rows.flatMap(r => {
    const p = predicted(r)
    return p == null ? [] : [Math.abs(p - r.place)]
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
  const current = rows.find(r => r.year === year)

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
      {current && (
        <ul className="list-disc space-y-1 border-t border-border py-3 pl-8 pr-4 text-xs text-muted">
          {current.indTime !== null && (
            <li>Ranking on Time: runners finished on average within <b className="text-text">{fmt(current.indTime)}</b> places of their predicted finish.</li>
          )}
          {current.indAdj !== null && (
            <li>Ranking on Adjusted Time: runners finished on average within <b className="text-text">{fmt(current.indAdj)}</b> places of their predicted finish.</li>
          )}
        </ul>
      )}
    </div>
  )
}
