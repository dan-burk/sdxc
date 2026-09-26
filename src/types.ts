export type Gender = 'boys' | 'girls'
export type SchoolClass = 'AA' | 'A' | 'B'
export type Tab = 'rankings' | 'race' | 'about'

// Shape of data/{gender}_{year}_week{n}.json rows, written by sdxc-data's export.r
export interface Runner {
  id: number // stable across weeks within a season
  Name: string
  School: string
  adj_time?: number // course-adjusted time in seconds (2025 on); lower is better
  points?: number // 2023 files only, from the old points-based method
  time_min: number | null // 5K PR in seconds despite the name; null = no 5K time yet
  rnk_blnd: number // overall rank, unique per file
  school_class: SchoolClass
}

export interface School {
  School: string
  school_class: SchoolClass
  region?: string | null // "1A"–"5A" or "1B"–"5B"; AA has no regions
}

// Shape of a state meet week file: one row per state finisher
export interface StateFinisher {
  id: number
  Name: string
  School: string
  school_class: SchoolClass
  race: SchoolClass
  place: number
  predicted: number | null // place predicted by the prior week's rankings; null = no race before state
  state_time: number // seconds
  rnk_blnd: number | null // ranking going into state
  adj_time: number | null
  time_min: number | null
}

export interface Manifest {
  current: number
  years: Record<string, number> // year -> latest scored week
  state?: Record<string, number> // year -> state meet week
}
