import { useEffect, useRef, useState } from "react"
import type { WireLogEvent } from "@/api"
import { JsonRenderer } from "@/components/renderers/JsonRenderer"

interface WireLogPaneProps {
  events: WireLogEvent[]
  onClear: () => void
  onClose: () => void
}

export function WireLogPane({ events, onClear, onClose }: WireLogPaneProps) {
  const listRef = useRef<HTMLDivElement>(null)
  const isAtBottomRef = useRef(true)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onScroll = () => {
      const dist = el.scrollHeight - el.scrollTop - el.clientHeight
      isAtBottomRef.current = dist < 60
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isAtBottomRef.current) return
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [events])

  return (
    <section className="flex w-[460px] shrink-0 flex-col border-l border-border bg-background">
      <header className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-4 text-[10px] uppercase tracking-wider text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="font-medium text-foreground">Wire log</span>
          <span className="font-mono normal-case tracking-normal">
            {events.length} event{events.length === 1 ? "" : "s"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            disabled={events.length === 0}
            className="hover:text-foreground disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            Clear
          </button>
          <span className="text-muted-foreground/40">·</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-foreground"
          >
            Close
          </button>
        </div>
      </header>
      <div ref={listRef} className="flex-1 overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-4 py-6 font-serif text-[13px] italic text-muted-foreground">
            No JSON-RPC traffic yet. Invoke a tool, resource, or prompt to see
            the wire events appear here.
          </p>
        ) : (
          <ul>
            {events.map((event, i) => (
              <WireLogRow key={i} event={event} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function WireLogRow({ event }: { event: WireLogEvent }) {
  const [expanded, setExpanded] = useState(false)
  const time = event.timestamp.slice(11, 23)
  const isOutgoing = event.direction === "→"

  return (
    <li className="border-b border-border/40 last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-1.5 text-left font-mono text-[12px] hover:bg-muted/40"
      >
        <span
          className={`w-3 text-[14px] leading-none ${
            isOutgoing ? "text-muted-foreground" : "text-brand"
          }`}
          aria-hidden
        >
          {event.direction}
        </span>
        <span className="tabular-nums text-muted-foreground/70">{time}</span>
        <span className="text-foreground">{event.method}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/50">
          {expanded ? "hide" : "show"}
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-3 pl-10">
          <JsonRenderer value={event.body} />
        </div>
      )}
    </li>
  )
}
