import { useEffect, useState } from 'react'
import type { Tab } from '../types'
import { Segmented } from './ui'

type Theme = 'system' | 'light' | 'dark'
const NEXT: Record<Theme, Theme> = { system: 'light', light: 'dark', dark: 'system' }
const TABS: Record<Tab, string> = { rankings: 'Rankings', race: 'Race Simulator' }

function readTheme(): Theme {
  try {
    const t = localStorage.getItem('theme')
    return t === 'light' || t === 'dark' ? t : 'system'
  } catch {
    return 'system'
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    const media = matchMedia('(prefers-color-scheme: dark)')
    const apply = () =>
      document.documentElement.classList.toggle('dark', theme === 'dark' || (theme === 'system' && media.matches))
    apply()
    try {
      if (theme === 'system') localStorage.removeItem('theme')
      else localStorage.setItem('theme', theme)
    } catch { /* storage blocked: theme still applies for this visit */ }
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  return (
    <button
      onClick={() => setTheme(NEXT[theme])}
      title={`Theme: ${theme}`}
      aria-label={`Theme: ${theme}. Click to change.`}
      className="flex h-9 w-9 items-center justify-center rounded text-muted transition-colors hover:bg-surface-2 hover:text-text"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
        {theme === 'light' && <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>}
        {theme === 'dark' && <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
        {theme === 'system' && <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></>}
      </svg>
    </button>
  )
}

export function TopBar({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <div className="border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-2 sm:px-6">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-bold tracking-tight">SD XC</span>
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
        <div className="order-last w-full sm:order-none sm:w-auto [&>div>div]:w-full [&>div]:w-full [&_button]:flex-1">
          <Segmented label="View" showLabel={false} options={Object.keys(TABS) as Tab[]} value={tab} onChange={onTab} render={t => TABS[t]} />
        </div>
        <ThemeToggle />
      </div>
    </div>
  )
}
