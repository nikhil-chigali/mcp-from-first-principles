import type { JSX } from "react"
import type { ResourceCardData } from "@/components/cards/types"
import { isTemplateResource } from "@/api"
import { ArgumentForm, type ArgumentFormField } from "@/components/ArgumentForm"
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
    const mimeType = result.mimeType

    if (mimeType.startsWith("application/pdf")) {
      return (
        <>
          <a
            href={result.content}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[13px] text-foreground underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground"
          >
            {result.content} ↗
          </a>
          <p className="mt-2 font-serif text-[12.5px] italic text-muted-foreground/70">
            PDF embed lands in Phase 5.
          </p>
        </>
      )
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
