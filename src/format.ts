// Seconds -> m:ss.s. Rounds to tenths first so 59.96 becomes 1:00.0, not 0:60.0.
export function formatTime(seconds: number | null): string {
  if (seconds === null) return '—'
  const tenths = Math.round(seconds * 10)
  const secs = ((tenths % 600) / 10).toFixed(1).padStart(4, '0')
  return `${Math.floor(tenths / 600)}:${secs}`
}

export const titleCase = (name: string) =>
  name.toLowerCase().replace(/(^|[\s'-])\S/g, c => c.toUpperCase())

export const formatPoints = (points: number) =>
  points.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
