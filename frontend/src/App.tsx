import { useEffect, useState } from "react"
import { api, type ConnectionState } from "@/api"
import { Button } from "@/components/ui/button"
import { ChatThread } from "@/components/ChatThread"
import { LeftRail, type PrimitiveSelection } from "@/components/LeftRail"
import { WireLogPane } from "@/components/WireLogPane"
import { useChatThread } from "@/hooks/useChatThread"
import { useConnectionState } from "@/hooks/useConnectionState"
import { useWireLog } from "@/hooks/useWireLog"

function App() {
  const {
    cards,
    addToolCard,
    addResourceCard,
    addPromptCard,
    submitForm,
    cancelForm,
  } = useChatThread()
  const wireLog = useWireLog()
  const connectionState = useConnectionState()
  const [paneOpen, setPaneOpen] = useState(false)

  useEffect(() => {
    if (!paneOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return
      if (e.key === "Escape") setPaneOpen(false)
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [paneOpen])

  const handleSelect = (selection: PrimitiveSelection) => {
    if (selection.kind === "tool") addToolCard(selection.tool)
    else if (selection.kind === "resource") addResourceCard(selection.resource)
    else addPromptCard(selection.prompt)
  }

  const handleReconnect = () => {
    void api.simulateReconnect()
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar
        paneOpen={paneOpen}
        onTogglePane={() => setPaneOpen((v) => !v)}
        eventCount={wireLog.events.length}
        connectionState={connectionState}
        onReconnect={handleReconnect}
      />
      <div className="flex min-h-0 flex-1">
        <LeftRail onSelect={handleSelect} />
        <ChatThread
          cards={cards}
          onSubmitForm={submitForm}
          onCancelForm={cancelForm}
        />
        {paneOpen && (
          <WireLogPane
            events={wireLog.events}
            onClear={wireLog.clear}
            onClose={() => setPaneOpen(false)}
          />
        )}
      </div>
    </div>
  )
}

interface TopBarProps {
  paneOpen: boolean
  onTogglePane: () => void
  eventCount: number
  connectionState: ConnectionState
  onReconnect: () => void
}

function TopBar({
  paneOpen,
  onTogglePane,
  eventCount,
  connectionState,
  onReconnect,
}: TopBarProps) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-baseline gap-2">
        <span className="font-serif text-[15px] tracking-tight text-foreground">
          MCP
        </span>
        <span className="text-muted-foreground/50">·</span>
        <span className="font-sans text-[13px] text-muted-foreground">
          papers
        </span>
      </div>
      <div className="flex items-center gap-4">
        <ConnectionPill
          state={connectionState}
          onReconnect={onReconnect}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={onTogglePane}
          aria-pressed={paneOpen}
          className={`h-7 gap-1.5 px-2 text-[11px] font-normal uppercase tracking-wider hover:text-foreground ${
            paneOpen ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Wire log
          {eventCount > 0 && (
            <span className="font-mono text-[10px] normal-case tracking-normal text-muted-foreground/70">
              {eventCount}
            </span>
          )}
        </Button>
      </div>
    </header>
  )
}

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connected: "connected",
  reconnecting: "reconnecting…",
  disconnected: "disconnected",
  error: "error",
}

const CONNECTION_DOT: Record<ConnectionState, string> = {
  connected: "bg-brand",
  reconnecting: "bg-amber-500 animate-pulse",
  disconnected: "bg-muted-foreground/50",
  error: "bg-destructive",
}

interface ConnectionPillProps {
  state: ConnectionState
  onReconnect: () => void
}

function ConnectionPill({ state, onReconnect }: ConnectionPillProps) {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
      <span
        className={`inline-block size-1.5 rounded-full ${CONNECTION_DOT[state]}`}
      />
      <span>{CONNECTION_LABEL[state]}</span>
      <button
        type="button"
        onClick={onReconnect}
        disabled={state === "reconnecting"}
        title="Simulate reconnect"
        aria-label="Simulate reconnect"
        className="ml-1 text-[13px] leading-none text-muted-foreground/60 transition-colors hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground/60"
      >
        ↻
      </button>
    </div>
  )
}

export default App
