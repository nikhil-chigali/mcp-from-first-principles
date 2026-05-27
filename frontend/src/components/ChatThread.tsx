import { useEffect, useRef, useState } from "react"
import type { Card } from "@/components/cards/types"
import { PromptCard } from "@/components/cards/PromptCard"
import { ResourceCard } from "@/components/cards/ResourceCard"
import { ToolCard } from "@/components/cards/ToolCard"

interface ChatThreadProps {
  cards: Card[]
  onSubmitForm: (cardId: string, args: Record<string, unknown>) => void
  onCancelForm: (cardId: string) => void
}

export function ChatThread({
  cards,
  onSubmitForm,
  onCancelForm,
}: ChatThreadProps) {
  const containerRef = useRef<HTMLElement>(null)
  const isAtBottomRef = useRef(true)
  const [hasNewContent, setHasNewContent] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const distFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight
      const nowAtBottom = distFromBottom < 120
      isAtBottomRef.current = nowAtBottom
      if (nowAtBottom) setHasNewContent(false)
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (cards.length === 0) return
    const el = containerRef.current
    if (!el) return
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight
    } else {
      setHasNewContent(true)
    }
  }, [cards])

  const jumpToLatest = () => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
    setHasNewContent(false)
  }

  return (
    <div className="relative flex min-w-0 flex-1 flex-col">
      <main
        ref={containerRef}
        className="flex flex-1 flex-col overflow-y-auto"
      >
        {cards.length === 0 ? (
          <div className="mx-auto w-full max-w-3xl px-10 py-20">
            <p className="font-serif text-[17px] leading-relaxed text-muted-foreground">
              No activity yet. Pick a tool, resource, or prompt from the left
              rail to begin.
            </p>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-10 py-8">
            {cards.map((card) => {
              if (card.kind === "tool") {
                return (
                  <ToolCard
                    key={card.id}
                    card={card}
                    onSubmit={(args) => onSubmitForm(card.id, args)}
                    onCancel={() => onCancelForm(card.id)}
                  />
                )
              }
              if (card.kind === "resource") {
                return (
                  <ResourceCard
                    key={card.id}
                    card={card}
                    onSubmit={(args) => onSubmitForm(card.id, args)}
                    onCancel={() => onCancelForm(card.id)}
                  />
                )
              }
              return (
                <PromptCard
                  key={card.id}
                  card={card}
                  onSubmit={(args) => onSubmitForm(card.id, args)}
                  onCancel={() => onCancelForm(card.id)}
                />
              )
            })}
          </div>
        )}
      </main>
      {hasNewContent && (
        <button
          type="button"
          onClick={jumpToLatest}
          className="absolute bottom-5 right-6 flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1 text-[11px] uppercase tracking-wider text-muted-foreground shadow-sm hover:border-foreground hover:text-foreground"
        >
          Jump to latest <span aria-hidden>↓</span>
        </button>
      )}
    </div>
  )
}
