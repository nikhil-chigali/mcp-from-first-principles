import { useState } from "react"
import type { JSX } from "react"
import type { PromptCardData } from "@/components/cards/types"
import { ArgumentForm } from "@/components/ArgumentForm"
import type { ArgumentFormField } from "@/components/ArgumentForm"
import { MarkdownRenderer } from "@/components/renderers/MarkdownRenderer"
import { CardShell } from "./CardShell"

interface PromptCardProps {
  card: PromptCardData
  onSubmit: (args: Record<string, unknown>) => void
  onCancel: () => void
}

export function PromptCard({ card, onSubmit, onCancel }: PromptCardProps): JSX.Element {
  const [showMessages, setShowMessages] = useState(false)

  const renderBody = () => {
    if (card.state === "pending-form") {
      const fields: ArgumentFormField[] = card.prompt.arguments.map((arg) => ({
        name: arg.name,
        type: "string",
        description: arg.description,
        required: arg.required ?? false,
      }))

      return (
        <>
          <p className="mb-4 font-serif text-[14px] leading-relaxed text-muted-foreground">
            {card.prompt.description}
          </p>
          <ArgumentForm
            fields={fields}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel="Invoke"
          />
        </>
      )
    }

    if (card.state === "running") {
      const hasArgs = card.args && Object.keys(card.args).length > 0
      return (
        <>
          <p className="text-[12.5px] text-muted-foreground">
            calling <span className="font-mono">prompts/get</span>…
          </p>
          {hasArgs && (
            <p className="mt-1 font-mono text-[12px] text-muted-foreground">
              args: {JSON.stringify(card.args)}
            </p>
          )}
        </>
      )
    }

    if (card.state === "streaming" || card.state === "done") {
      const messages = card.messages ?? []
      return (
        <>
          <button
            type="button"
            onClick={() => setShowMessages((v) => !v)}
            className="mb-3 inline-flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground/80 hover:text-foreground"
          >
            {showMessages ? "Hide" : "Show"} template messages{" "}
            <span aria-hidden>{showMessages ? "▾" : "▸"}</span>
          </button>
          {showMessages &&
            messages.map((message, idx) => (
              <div key={idx} className="mb-2 border-l border-l-border pl-3">
                <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground/60">
                  {message.role}
                </p>
                <p className="whitespace-pre-wrap font-serif text-[13.5px] leading-relaxed text-foreground">
                  {message.content}
                </p>
              </div>
            ))}
          {card.streamed ? (
            <MarkdownRenderer content={card.streamed} />
          ) : null}
        </>
      )
    }

    return null
  }

  return (
    <CardShell
      kind="prompt"
      title={card.prompt.name}
      state={card.state}
      error={card.error}
    >
      {renderBody()}
    </CardShell>
  )
}
