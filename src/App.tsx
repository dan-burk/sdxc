import { useState } from 'react'
import { About } from './components/About'
import { FilterBar, type ClassFilter } from './components/FilterBar'
import { RaceSim } from './components/RaceSim'
import { RankingsTable } from './components/RankingsTable'
import { TopBar } from './components/TopBar'
import { ErrorCard } from './components/ui'
import { getManifest } from './data'
import { useAsync } from './hooks'
import type { Gender, Manifest, Tab } from './types'

export default function App() {
  const { data: manifest, error, retry } = useAsync(getManifest, [])
  if (manifest) return <Shell manifest={manifest} />
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      {error
        ? <ErrorCard message="Couldn't load the season list." onRetry={retry} />
        : <span className="font-display text-2xl font-bold text-muted motion-safe:animate-pulse">SD XC</span>}
    </div>
  )
}

function Shell({ manifest }: { manifest: Manifest }) {
  const years = Object.keys(manifest.years).map(Number).sort((a, b) => a - b)
  const [tab, setTab] = useState<Tab>('rankings')
  const [year, setYear] = useState(manifest.current)
  const [week, setWeek] = useState(manifest.years[manifest.current])
  const [gender, setGender] = useState<Gender>('boys')
  const [cls, setCls] = useState<ClassFilter>('All')
  const [schools, setSchools] = useState<string[]>([]) // kept here so switching tabs doesn't lose picks

  const onYear = (y: number) => {
    setYear(y)
    setWeek(manifest.years[y])
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-20">
        <TopBar tab={tab} onTab={setTab} />
        {tab !== 'about' && (
          <FilterBar
            years={years} year={year} onYear={onYear}
            latestWeek={manifest.years[year]} week={week} onWeek={setWeek}
            gender={gender} onGender={setGender}
            cls={tab === 'rankings' ? cls : undefined} onCls={setCls}
          />
        )}
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        {tab === 'rankings' && <RankingsTable gender={gender} year={year} week={week} cls={cls} />}
        {tab === 'race' && <RaceSim gender={gender} year={year} week={week} selected={schools} onSelected={setSchools} />}
        {tab === 'about' && <About />}
      </main>
    </div>
  )
}
