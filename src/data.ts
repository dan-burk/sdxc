import type { Gender, Manifest, Runner, School, StateFinisher } from './types'

// Dev reads the local data/ folder so unpushed exports can be previewed;
// the deployed site reads master live, so data pushes need no redeploy.
const BASE = import.meta.env.DEV
  ? '/data/'
  : 'https://raw.githubusercontent.com/dan-burk/sdxc/master/data/'

const cache = new Map<string, Promise<unknown>>()

function fetchJson<T>(file: string): Promise<T> {
  let request = cache.get(file)
  if (!request) {
    request = fetch(BASE + file).then(res => {
      if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`)
      return res.json()
    })
    request.catch(() => cache.delete(file)) // let Retry refetch
    cache.set(file, request)
  }
  return request as Promise<T>
}

export const getManifest = () => fetchJson<Manifest>('manifest.json')
export const getSchools = (year: number) => fetchJson<School[]>(`schools_${year}.json`)
export const getRankings = (gender: Gender, year: number, week: number) =>
  fetchJson<Runner[]>(`${gender}_${year}_week${week}.json`)
// The state meet week uses the same file name but a different shape
export const getStateResults = (gender: Gender, year: number, week: number) =>
  fetchJson<StateFinisher[]>(`${gender}_${year}_week${week}.json`)
