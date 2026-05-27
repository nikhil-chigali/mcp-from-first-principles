import { Button } from "@/components/ui/button"
import { LeftRail, type PrimitiveSelection } from "@/components/LeftRail"

function App() {
  const handleSelect = (selection: PrimitiveSelection) => {
    // Phase 3: log selections so we can verify wiring. Phase 4 replaces this
    // with appending a card to the chat thread.
    console.log("[mcp] selected", selection)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftRail onSelect={handleSelect} />
        <ChatThread />
      </div>
    </div>
  )
}

function TopBar() {
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
          className="h-7 px-2 text-[11px] font-normal uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Wire log
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

function ChatThread() {
  return (
    <main className="flex min-w-0 flex-1 flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-3xl px-10 py-20">
        <p className="font-serif text-[17px] leading-relaxed text-muted-foreground">
          No activity yet. Pick a tool, resource, or prompt from the left rail
          to begin.
        </p>
      </div>
    </main>
  )
}

export default App
