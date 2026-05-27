import type { JSX } from "react"
import type { ToolCallResult } from "@/api"
import type { ToolCardData } from "@/components/cards/types"
import { ArgumentForm, type ArgumentFormField } from "@/components/ArgumentForm"
import { JsonRenderer } from "@/components/renderers/JsonRenderer"
import { MarkdownRenderer } from "@/components/renderers/MarkdownRenderer"
import { PdfRenderer } from "@/components/renderers/PdfRenderer"
import { CardShell } from "./CardShell"

function renderResult(result: ToolCallResult): JSX.Element {
  const mime = result.mimeType
  if (mime.startsWith("application/json")) {
    return <JsonRenderer value={result.result} />
  }
  if (mime.startsWith("text/markdown")) {
    return <MarkdownRenderer content={String(result.result)} />
  }
  if (mime.startsWith("application/pdf")) {
    return <PdfRenderer url={String(result.result)} />
  }
  return (
    <pre className="overflow-x-auto rounded bg-muted/40 p-3 font-mono text-[12.5px] leading-relaxed text-foreground">
      {String(result.result)}
    </pre>
  )
}

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

      return (
        <>
          {hasArgs ? (
            <p className="mb-3 font-mono text-[12px] text-muted-foreground">
              args: {JSON.stringify(card.args)}
            </p>
          ) : null}
          {result ? renderResult(result) : null}
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
