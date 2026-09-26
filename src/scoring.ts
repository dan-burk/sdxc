import type { Runner, SchoolClass } from './types'

// SD scores 3/4/5 runners and lets 5/6/7 run in B/A/AA
export const LIMITS: Record<SchoolClass, { score: number; run: number }> = {
  B: { score: 3, run: 5 },
  A: { score: 4, run: 6 },
  AA: { score: 5, run: 7 },
}

export interface Finisher {
  runner: Runner
  place: number
  teamPlace: number | null // null for runners on incomplete teams
  role: 'scorer' | 'displacer' | null
}

export interface TeamResult {
  school: string
  complete: boolean
  entrants: number
  score: number
  scorers: number[]
  displacers: number[]
  tied: boolean // shares its score with another team; order came from the tiebreak
}

export function simulateRace(runners: Runner[], schools: string[], cls: SchoolClass) {
  const { score, run } = LIMITS[cls]
  const selected = new Set(schools)

  // Each school's entrants are its top `run` runners by overall rank
  const bySchool = new Map<string, Runner[]>(schools.map(s => [s, []]))
  for (const r of [...runners].sort((a, b) => a.rnk_blnd - b.rnk_blnd)) {
    const list = bySchool.get(r.School)
    if (selected.has(r.School) && list && list.length < run) list.push(r)
  }

  const teams = new Map<string, TeamResult>()
  for (const [school, list] of bySchool) {
    teams.set(school, {
      school, complete: list.length >= score, entrants: list.length,
      score: 0, scorers: [], displacers: [], tied: false,
    })
  }

  // Runners on incomplete teams place individually but take no team places
  let teamPlace = 0
  const finishers: Finisher[] = [...bySchool.values()]
    .flat()
    .sort((a, b) => a.rnk_blnd - b.rnk_blnd)
    .map((runner, i) => {
      const team = teams.get(runner.School)!
      if (!team.complete) return { runner, place: i + 1, teamPlace: null, role: null }
      const tp = ++teamPlace
      if (team.scorers.length < score) {
        team.scorers.push(tp)
        team.score += tp
        return { runner, place: i + 1, teamPlace: tp, role: 'scorer' }
      }
      team.displacers.push(tp)
      return { runner, place: i + 1, teamPlace: tp, role: 'displacer' }
    })

  // Lowest score wins; ties go to the better first non-scorer (the "6th runner" rule)
  const standings = [...teams.values()].sort((a, b) => {
    if (a.complete !== b.complete) return a.complete ? -1 : 1
    if (!a.complete) return b.entrants - a.entrants
    if (a.score !== b.score) return a.score - b.score
    const a6 = a.displacers[0] ?? Infinity
    const b6 = b.displacers[0] ?? Infinity
    return a6 === b6 ? 0 : a6 - b6
  })
  for (const t of standings) {
    t.tied = t.complete && standings.some(o => o !== t && o.complete && o.score === t.score)
  }

  return { finishers, standings }
}
