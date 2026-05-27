import type { JSX } from "react"
import type { ResourceCardData } from "@/components/cards/types"
import { isTemplateResource } from "@/api"
import { ArgumentForm, type ArgumentFormField } from "@/components/ArgumentForm"
import { JsonRenderer } from "@/components/renderers/JsonRenderer"
import { MarkdownRenderer } from "@/components/renderers/MarkdownRenderer"
import { PdfRenderer } from "@/components/renderers/PdfRenderer"
import { CardShell } from "./CardShell"

interface ResourceCardProps {
  card: ResourceCardData
  onSubmit: (args: Record<string, unknown>) => void
  onCancel: () => void
}

export function ResourceCard({ card, onSubmit, onCancel }: ResourceCardProps): JSX.Element {
  const title = isTemplateResource(card.resource)
    ? card.resource.uriTemplate
    : card.resource.uri

  const renderResult = (): JSX.Element | null => {
    const result = card.result
    if (!result) return null
    const mime = result.mimeType

    if (mime.startsWith("application/pdf")) {
      return <PdfRenderer url={result.content} />
    }
    if (mime.startsWith("application/json")) {
      let value: unknown = result.content
      try {
        value = JSON.parse(result.content)
      } catch {
        // fall back to rendering the raw string
      }
      return <JsonRenderer value={value} />
    }
    if (mime.startsWith("text/markdown")) {
      return <MarkdownRenderer content={result.content} />
    }
    return (
      <pre className="overflow-x-auto rounded bg-muted/40 p-3 font-mono text-[12.5px] leading-relaxed text-foreground">
        {result.content}
      </pre>
    )
  }

  const renderBody = (): JSX.Element | null => {
    if (card.state === "pending-form") {
      if (!isTemplateResource(card.resource)) return null
      const template = card.resource.uriTemplate
      const params = Array.from(
        template.matchAll(/\{([^}]+)\}/g),
        (m): string => m[1] ?? "",
      )
      const fields: ArgumentFormField[] = params.map((param) => ({
        name: param,
        type: "string",
        description: undefined,
        required: true,
      }))

      return (
        <>
          {card.resource.description ? (
            <p className="mb-4 font-serif text-[14px] leading-relaxed text-muted-foreground">
              {card.resource.description}
            </p>
          ) : null}
          <ArgumentForm
            fields={fields}
            onSubmit={onSubmit}
            onCancel={onCancel}
            submitLabel="Read"
          />
        </>
      )
    }

    if (card.state === "running") {
      return (
        <>
          <p className="text-[12.5px] text-muted-foreground">
            reading <span className="font-mono">resources/read</span>…
          </p>
          {card.resolvedUri ? (
            <p className="mt-1 font-mono text-[12px] text-muted-foreground">
              uri: {card.resolvedUri}
            </p>
          ) : null}
        </>
      )
    }

    if (card.state === "done") {
      const showResolved = card.resolvedUri && card.resolvedUri !== title
      return (
        <>
          {showResolved ? (
            <p className="mb-3 font-mono text-[12px] text-muted-foreground">
              uri: {card.resolvedUri}
            </p>
          ) : null}
          {renderResult()}
        </>
      )
    }

    return null
  }

  return (
    <CardShell kind="resource" title={title} state={card.state} error={card.error}>
      {renderBody()}
    </CardShell>
  )
}
