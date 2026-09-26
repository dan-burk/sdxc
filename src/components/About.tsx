const LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/daniel-burkhalter1/' },
  { label: 'GitHub', href: 'https://github.com/dan-burk' },
  { label: 'Code', href: 'https://github.com/dan-burk/sdxc' },
]

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
    </section>
  )
}
