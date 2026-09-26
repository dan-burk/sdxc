const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-burkhalter1/' },
  { label: 'GitHub', href: 'https://github.com/dan-burk' },
  { label: 'Code', href: 'https://github.com/dan-burk/sdxc' },
]

// Example points are illustrative; only their order matters
const EXAMPLE = [
  { name: 'Gabe Peters', time: '16:40', points: 1250, timeRank: 2, pointsRank: 1 },
  { name: 'Jonathan Burkhalter', time: '15:30', points: 870, timeRank: 1, pointsRank: 3 },
  { name: 'Daniel Burkhalter', time: '17:00', points: 980, timeRank: 3, pointsRank: 2 },
].map(r => ({ ...r, median: (r.timeRank + r.pointsRank) / 2 }))

type Row = (typeof EXAMPLE)[number]

function Step({ n, title, caption, rows, value }: {
  n: number
  title: string
  caption: string
  rows: Row[]
  value: (r: Row) => string
}) {
  return (
    <div className="card p-5">
      <div className="label">Step {n}</div>
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      <ol className="mt-3 divide-y divide-border text-sm">
        {rows.map((r, i) => (
          <li key={r.name} className="flex items-center gap-3 py-2">
            <span className="w-5 text-right font-display text-lg font-semibold">{i + 1}</span>
            <span className="flex-1 font-medium">{r.name}</span>
            <span className="tabular-nums text-muted">{value(r)}</span>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-muted">{caption}</p>
    </div>
  )
}

function HowItWorks() {
  const by = (key: 'timeRank' | 'pointsRank' | 'median') => [...EXAMPLE].sort((a, b) => a[key] - b[key])
  return (
    <div className="space-y-4 pt-4">
      <h2 className="font-display text-3xl font-semibold">How it Works</h2>
      <p className="leading-relaxed">
        Every runner gets two ranks, one by time and one by points. Their final rank is the median of the two.
      </p>
      <Step n={1} title="Rank by time" rows={by('timeRank')} value={r => r.time}
        caption="Jonathan has the fastest 5K, so he's first on time." />
      <Step n={2} title="Rank by points" rows={by('pointsRank')} value={r => r.points.toLocaleString()}
        caption="Gabe has never lost to Jonathan, and Daniel has more points than Jonathan too, so Jonathan is last on points." />
      <Step n={3} title="Take the median rank" rows={by('median')} value={r => `${r.timeRank} & ${r.pointsRank} → ${r.median}`}
        caption="With two ranks, the median is their average. Gabe's 1.5 beats Jonathan's 2, so Gabe ranks first overall." />
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
