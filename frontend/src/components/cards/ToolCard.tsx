import type { JSX } from "react"
import type { ToolCardData } from "@/components/cards/types"
import { ArgumentForm, type ArgumentFormField } from "@/components/ArgumentForm"
import { CardShell } from "./CardShell"

interface ToolCardProps {
  card: ToolCardData
  onSubmit: (args: Record<string, unknown>) => void
  onCancel: () => void
}

export function ToolCard({ card, onSubmit, onCancel }: ToolCardProps): JSX.Element {
  const renderBody = (): JSX.Element | null => {
    if (card.state === "pending-form") {
      const properties = card.tool.inputSchema.properties ?? {}
      const required = card.tool.inputSchema.required ?? []
      const fields: ArgumentFormField[] = Object.entries(properties).map(([name, prop]) => ({
        name,
        type: "string",
        description: prop.description,
        required: required.includes(name),
      }))

      return (
        <>
          <p className="mb-4 font-serif text-[14px] leading-relaxed text-muted-foreground">
            {card.tool.description}
          </p>
          <ArgumentForm
            fields={fields}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel="Call"
          />
        </>
      )
    }

    if (card.state === "running") {
      const hasArgs = card.args && Object.keys(card.args).length > 0
      return (
        <div className="flex flex-col gap-2">
          <p className="text-[12.5px] text-muted-foreground">
            calling <span className="font-mono">tools/call</span>…
          </p>
          {hasArgs ? (
            <p className="font-mono text-[12px] text-muted-foreground">
              <span>args:</span> {JSON.stringify(card.args)}
            </p>
          ) : null}
        </div>
      )
    }

    if (card.state === "done") {
      const hasArgs = card.args && Object.keys(card.args).length > 0
      const result = card.result
      const mimeType = result?.mimeType ?? ""
      const isText = mimeType.startsWith("text/")
      const content = result
        ? isText
          ? String(result.result)
          : JSON.stringify(result.result, null, 2)
        : ""

      return (
        <>
          {hasArgs ? (
            <p className="mb-3 font-mono text-[12px] text-muted-foreground">
              args: {JSON.stringify(card.args)}
            </p>
          ) : null}
          {result ? (
            <pre className="overflow-x-auto rounded bg-muted/40 p-3 font-mono text-[12.5px] leading-relaxed text-foreground">
              {content}
            </pre>
          ) : null}
        </>
      )
    }

    return null
  }

  return (
    <CardShell kind="tool" title={card.tool.name} state={card.state} error={card.error}>
      {renderBody()}
    </CardShell>
  )
}
