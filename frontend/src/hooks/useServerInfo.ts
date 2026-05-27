import { useEffect, useState } from "react"
import { api, type ServerInfo } from "@/api"

interface UseServerInfo {
  data: ServerInfo | null
  loading: boolean
  error: Error | null
}

export function useServerInfo(): UseServerInfo {
  const [data, setData] = useState<ServerInfo | null>(null)
  const [error, setError] = useState<Error | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api
      .getServerInfo()
      .then((info) => {
        if (cancelled) return
        setData(info)
        setError(null)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err : new Error(String(err)))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { data, loading, error }
}
