import { useEffect, useState } from 'react'

interface AsyncState<T> {
  data?: T
  error?: Error
  loading: boolean
}

// Runs fn whenever deps change; ignores results from superseded runs
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[]) {
  const key = JSON.stringify(deps)
  const [state, setState] = useState<AsyncState<T> & { key?: string }>({ loading: true })
  const [attempt, setAttempt] = useState(0)
  const retry = () => setAttempt(n => n + 1)

  useEffect(() => {
    let current = true
    setState({ loading: true, key })
    fn().then(
      data => current && setState({ data, loading: false, key }),
      error => current && setState({ error, loading: false, key }),
    )
    return () => { current = false }
  }, [key, attempt])

  // The render after deps change still holds the old result; don't pair it with the new deps
  if (state.key !== key) return { data: undefined, error: undefined, loading: true, retry }
  return { data: state.data, error: state.error, loading: state.loading, retry }
}
