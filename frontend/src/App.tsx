import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <LeftRail />
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

function LeftRail() {
  return (
    <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-border bg-background">
      <nav className="flex flex-col py-5">
        <RailSection
          title="Tools"
          items={["get_papers_of_the_day", "save_arxiv"]}
        />
        <RailSection
          title="Resources"
          items={[
            "papers://list",
            "papers://{id}/pdf",
            "papers://{id}/markdown",
          ]}
        />
        <RailSection title="Prompts" items={["explain", "newsletter"]} />
      </nav>
    </aside>
  )
}

function RailSection({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="px-5 py-3">
      <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
        {title}
      </h2>
      <ul className="-mx-1.5">
        {items.map((item) => (
          <li key={item}>
            <button
              type="button"
              className="block w-full truncate rounded px-1.5 py-1 text-left font-mono text-[12.5px] text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
            >
              {item}
            </button>
          </li>
        ))}
      </ul>
    </section>
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
