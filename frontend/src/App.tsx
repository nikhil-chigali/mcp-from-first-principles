import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChatThread } from "@/components/ChatThread"
import { LeftRail, type PrimitiveSelection } from "@/components/LeftRail"
import { WireLogPane } from "@/components/WireLogPane"
import { useChatThread } from "@/hooks/useChatThread"
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
  const [paneOpen, setPaneOpen] = useState(false)

  const handleSelect = (selection: PrimitiveSelection) => {
    if (selection.kind === "tool") addToolCard(selection.tool)
    else if (selection.kind === "resource") addResourceCard(selection.resource)
    else addPromptCard(selection.prompt)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar
        paneOpen={paneOpen}
        onTogglePane={() => setPaneOpen((v) => !v)}
        eventCount={wireLog.events.length}
      />
      <div className="flex min-h-0 flex-1">
        <LeftRail onSelect={handleSelect} />
        <ChatThread
          cards={cards}
          onSubmitForm={submitForm}
          onCancelForm={cancelForm}
        />
      </div>
      {paneOpen && (
        <WireLogPane
          events={wireLog.events}
          onClear={wireLog.clear}
          onClose={() => setPaneOpen(false)}
        />
      )}
    </div>
  )
}

interface TopBarProps {
  paneOpen: boolean
  onTogglePane: () => void
  eventCount: number
}

function TopBar({ paneOpen, onTogglePane, eventCount }: TopBarProps) {
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
        <ConnectionPill />
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

function ConnectionPill() {
  return (
    <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
      <span className="inline-block size-1.5 rounded-full bg-brand" />
      <span>connected</span>
    </div>
  )
}

export default App
