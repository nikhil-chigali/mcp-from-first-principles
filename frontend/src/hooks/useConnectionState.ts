import { useEffect, useState } from "react"
import { api, type ConnectionState } from "@/api"

export function useConnectionState(): ConnectionState {
  const [state, setState] = useState<ConnectionState>("connected")

  useEffect(() => {
    return api.subscribeConnection(setState)
  }, [])

  return state
}
