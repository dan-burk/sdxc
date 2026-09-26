export type Gender = 'boys' | 'girls'
export type SchoolClass = 'AA' | 'A' | 'B'
export type Tab = 'rankings' | 'race' | 'about'

// Shape of data/{gender}_{year}_week{n}.json rows, written by sdxc-data's export.r
export interface Runner {
  id: number // stable across weeks within a season
  Name: string
  School: string
  points: number
  time_min: number | null // seconds despite the name; null = no 5K time yet
  rnk_blnd: number // overall rank, unique per file
  school_class: SchoolClass
}

export interface School {
  School: string
  school_class: SchoolClass
  region?: string | null // "1A"–"5A" or "1B"–"5B"; AA has no regions
}

export interface Manifest {
  current: number
  years: Record<string, number> // year -> latest scored week
}
