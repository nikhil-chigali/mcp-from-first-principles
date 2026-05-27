import { Button } from "@/components/ui/button"
import { ChatThread } from "@/components/ChatThread"
import { LeftRail, type PrimitiveSelection } from "@/components/LeftRail"
import { useChatThread } from "@/hooks/useChatThread"

function App() {
  const {
    cards,
    addToolCard,
    addResourceCard,
    addPromptCard,
    submitForm,
    cancelForm,
  } = useChatThread()

  const handleSelect = (selection: PrimitiveSelection) => {
    if (selection.kind === "tool") addToolCard(selection.tool)
    else if (selection.kind === "resource") addResourceCard(selection.resource)
    else addPromptCard(selection.prompt)
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftRail onSelect={handleSelect} />
        <ChatThread
          cards={cards}
          onSubmitForm={submitForm}
          onCancelForm={cancelForm}
        />
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

export default App
