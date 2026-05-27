import { useCallback, useEffect, useState } from "react"
import { api, type WireLogEvent } from "@/api"

const MAX_EVENTS = 500

interface UseWireLog {
  events: WireLogEvent[]
  clear: () => void
}

export function useWireLog(): UseWireLog {
  const [events, setEvents] = useState<WireLogEvent[]>([])

  useEffect(() => {
    return api.subscribeWireLog((event) => {
      setEvents((prev) => {
        const next = [...prev, event]
        return next.length > MAX_EVENTS
          ? next.slice(next.length - MAX_EVENTS)
          : next
      })
    })
  }, [])

  const clear = useCallback(() => setEvents([]), [])

  return { events, clear }
}
