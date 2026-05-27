import type { JSX } from "react"

interface PdfRendererProps {
  url: string
}

export function PdfRenderer({ url }: PdfRendererProps): JSX.Element {
  if (!url || !url.trim()) {
    return (
      <p className="font-serif text-[13px] italic text-destructive">
        No PDF URL provided.
      </p>
    )
  }

  return (
    <>
      <iframe
        src={url}
        title="PDF preview"
        loading="lazy"
        className="block w-full h-[640px] rounded border border-border bg-muted/30"
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-[11.5px] text-muted-foreground">
        <span className="truncate font-mono">{url}</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 text-foreground underline decoration-muted-foreground/40 underline-offset-2 hover:decoration-foreground"
        >
          open in new tab ↗
        </a>
      </div>
    </>
  )
}
