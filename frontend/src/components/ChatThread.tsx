import { useEffect, useRef } from "react"
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

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const onScroll = () => {
      const distFromBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight
      isAtBottomRef.current = distFromBottom < 120
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!isAtBottomRef.current) return
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [cards])

  return (
    <main
      ref={containerRef}
      className="flex min-w-0 flex-1 flex-col overflow-y-auto"
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
  )
}
