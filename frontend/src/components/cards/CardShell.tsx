import type { ReactNode } from "react"
import type { CardState } from "./types"

interface CardShellProps {
  kind: "tool" | "resource" | "prompt"
  title: string
  state: CardState
  error?: string
  children: ReactNode
}

export function CardShell({
  kind,
  title,
  state,
  error,
  children,
}: CardShellProps) {
  return (
    <article className="border-l-2 border-l-brand pl-5 py-1">
      <header className="mb-3 flex items-center gap-3 text-[10px] uppercase tracking-[0.14em]">
        <span className="text-muted-foreground/80">{kind}</span>
        <span className="font-mono text-[11px] normal-case tracking-normal text-foreground">
          {title}
        </span>
        <StateIndicator state={state} />
      </header>
      {error && (
        <p className="mb-3 font-mono text-[12.5px] text-destructive">
          {error}
        </p>
      )}
      {children}
    </article>
  )
}

function StateIndicator({ state }: { state: CardState }) {
  const labels: Record<CardState, string> = {
    "pending-form": "needs args",
    running: "running",
    streaming: "streaming",
    done: "done",
    error: "error",
  }
  const dotClass: Record<CardState, string> = {
    "pending-form": "bg-muted-foreground/40",
    running: "bg-brand animate-pulse",
    streaming: "bg-brand animate-pulse",
    done: "bg-muted-foreground/30",
    error: "bg-destructive",
  }
  return (
    <span className="ml-auto flex items-center gap-1.5 text-muted-foreground/70">
      <span className={`inline-block size-1.5 rounded-full ${dotClass[state]}`} />
      <span>{labels[state]}</span>
    </span>
  )
}
