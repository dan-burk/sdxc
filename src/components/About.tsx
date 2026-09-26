import type { ReactNode } from 'react'

const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-burkhalter1/' },
  { label: 'GitHub', href: 'https://github.com/dan-burk' },
  { label: 'Code', href: 'https://github.com/dan-burk/sdxc' },
]

const mmss = (seconds: number) => {
  const t = Math.round(seconds)
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`
}

// fast = how much faster than usual everyone ran at that meet, in percent (negative = slow)
const adjust = (seconds: number, fast: number) => seconds * (1 + fast / 100)
const meet = (fast: number) => (fast === 0 ? 'typical meet' : `${Math.abs(fast)}% ${fast > 0 ? 'fast' : 'slow'} meet`)

const EXAMPLE = [
  { name: 'Gabe Peters', time: 1000, fast: -2 },
  { name: 'Jonathan Burkhalter', time: 930, fast: 6 },
  { name: 'Daniel Burkhalter', time: 1020, fast: 0 },
]
  .map(r => ({ ...r, adjusted: adjust(r.time, r.fast) }))
  .sort((a, b) => a.adjusted - b.adjusted)

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <div className="card p-5">
      <div className="label">Step {n}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <div className="mt-2 space-y-3 text-sm">{children}</div>
    </div>
  )
}

function HowItWorks() {
  return (
    <div className="space-y-4 pt-4">
      <h2 className="font-display text-3xl font-semibold">How it Works</h2>
      <p className="leading-relaxed">
        Runners are ranked by their average time on a typical 5K course, so a fast course doesn't make you look faster
        than you are.
      </p>
      <Step n={1} title="Rate every meet">
        <p className="text-muted">
          Every meet gets a speed rating: how much faster or slower everyone ran there than usual, from the course,
          distance and weather.
        </p>
      </Step>
      <Step n={2} title="Adjust every time">
        <div className="flex items-center gap-3 font-display text-2xl font-semibold tabular-nums">
          15:37 <span className="text-base text-muted">→</span> <span className="text-accent">16:20</span>
        </div>
        <p className="text-muted">A 15:37 at a meet where everyone ran 4.6% fast counts as about 16:20 on a typical 5K course.</p>
      </Step>
      <Step n={3} title="Average and rank">
        <ol className="divide-y divide-border">
          {EXAMPLE.map((r, i) => (
            <li key={r.name} className="flex items-center gap-3 py-2">
              <span className="w-5 text-right font-display text-lg font-semibold">{i + 1}</span>
              <span className="flex-1">
                <span className="block font-medium">{r.name}</span>
                <span className="text-xs text-muted">{mmss(r.time)} at a {meet(r.fast)}</span>
              </span>
              <span className="font-semibold tabular-nums">{mmss(r.adjusted)}</span>
            </li>
          ))}
        </ol>
        <p className="text-muted">
          Each runner's adjusted times are averaged, and the lowest average ranks first. Jonathan ran the fastest time,
          but on a fast course, so Gabe ranks first.
        </p>
      </Step>
    </div>
  )
}

export function About() {
  return (
    <section className="mx-auto max-w-2xl space-y-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">About</h1>
      <div className="card space-y-4 p-5 sm:p-6">
        <h2 className="font-display text-2xl font-semibold">Hi, I'm Daniel!</h2>
        <p className="leading-relaxed">
          I'm a runner, data scientist, and self-taught full-stack (maybe more like a garbage-stack) developer.
          I ran XC for Bison from 2013–2018, then at SDSU from 2018–2024. Love this sport. Feel free to reach out
          if you have any questions or see any issues!
        </p>
        <div className="border-t border-border pt-4">
          <div className="label mb-2">Author</div>
          <div className="font-medium">Daniel Burkhalter</div>
          <div className="mt-3 flex flex-wrap gap-2">
            {LINKS.map(l => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded border border-border px-3 py-1.5 text-sm font-semibold text-accent transition-colors hover:bg-accent-soft"
              >
                {l.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
      <HowItWorks />
    </section>
  )
}
