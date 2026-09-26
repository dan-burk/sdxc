import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data?: T
  error?: Error
  loading: boolean
}

// Runs fn whenever deps change; ignores results from superseded runs
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const [state, setState] = useState<AsyncState<T>>({ loading: true })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let current = true
    setState({ loading: true })
    fn().then(
      data => current && setState({ data, loading: false }),
      error => current && setState({ error, loading: false }),
    )
    return () => { current = false }
  }, [...deps, attempt])

  return { ...state, retry: () => setAttempt(n => n + 1) }
}
