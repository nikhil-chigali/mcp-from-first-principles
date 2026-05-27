import { useCallback, useRef, useState } from "react"
import {
  api,
  isTemplateResource,
  type Prompt,
  type Resource,
  type Tool,
} from "@/api"
import type {
  Card,
  CardId,
  PromptCardData,
  ResourceCardData,
  ToolCardData,
} from "@/components/cards/types"

let cardIdCounter = 0
const newCardId = () => `card-${++cardIdCounter}`
const nowIso = () => new Date().toISOString()

function toolNeedsForm(tool: Tool): boolean {
  return Object.keys(tool.inputSchema.properties ?? {}).length > 0
}
function promptNeedsForm(prompt: Prompt): boolean {
  return prompt.arguments.length > 0
}
function resourceNeedsForm(resource: Resource): boolean {
  return isTemplateResource(resource)
}
function resolveTemplate(
  template: string,
  args: Record<string, unknown>,
): string {
  return template.replace(/\{([^}]+)\}/g, (_, key: string) =>
    String(args[key] ?? ""),
  )
}

export function useChatThread() {
  const [cards, setCards] = useState<Card[]>([])
  const cardsRef = useRef<Card[]>([])
  cardsRef.current = cards

  // Replace any existing pending-form card; only one form open at a time.
  const replacePendingForm = (next: Card[]): Card[] =>
    next.filter((c) => c.state !== "pending-form")

  const updateCard = useCallback(
    (id: CardId, mut: (c: Card) => Card) => {
      setCards((prev) => prev.map((c) => (c.id === id ? mut(c) : c)))
    },
    [],
  )

  const runTool = useCallback(
    async (id: CardId, tool: Tool, args: Record<string, unknown>) => {
      updateCard(
        id,
        (c) =>
          ({ ...c, state: "running", args }) as ToolCardData,
      )
      try {
        const result = await api.callTool(tool.name, args)
        updateCard(
          id,
          (c) =>
            ({
              ...c,
              state: result.isError ? "error" : "done",
              result,
              error: result.isError
                ? "Tool reported an error."
                : undefined,
            }) as ToolCardData,
        )
      } catch (err) {
        updateCard(
          id,
          (c) =>
            ({
              ...c,
              state: "error",
              error: err instanceof Error ? err.message : String(err),
            }) as ToolCardData,
        )
      }
    },
    [updateCard],
  )

  const runResource = useCallback(
    async (
      id: CardId,
      resource: Resource,
      args: Record<string, unknown>,
    ) => {
      const uri = isTemplateResource(resource)
        ? resolveTemplate(resource.uriTemplate, args)
        : resource.uri
      updateCard(
        id,
        (c) =>
          ({
            ...c,
            state: "running",
            args,
            resolvedUri: uri,
          }) as ResourceCardData,
      )
      try {
        const result = await api.readResource(uri)
        updateCard(
          id,
          (c) =>
            ({ ...c, state: "done", result }) as ResourceCardData,
        )
      } catch (err) {
        updateCard(
          id,
          (c) =>
            ({
              ...c,
              state: "error",
              error: err instanceof Error ? err.message : String(err),
            }) as ResourceCardData,
        )
      }
    },
    [updateCard],
  )

  // Phase 4 stub: prompt invocation lands in Phase 6 (SSE consumption).
  const runPromptStub = useCallback(
    async (id: CardId, _prompt: Prompt, args: Record<string, unknown>) => {
      updateCard(
        id,
        (c) =>
          ({ ...c, state: "running", args }) as PromptCardData,
      )
      await new Promise((r) => setTimeout(r, 400))
      updateCard(
        id,
        (c) =>
          ({
            ...c,
            state: "error",
            error: "Prompt invocation arrives in Phase 6.",
          }) as PromptCardData,
      )
    },
    [updateCard],
  )

  const addToolCard = useCallback(
    (tool: Tool) => {
      const id = newCardId()
      const card: ToolCardData = {
        id,
        createdAt: nowIso(),
        kind: "tool",
        tool,
        state: toolNeedsForm(tool) ? "pending-form" : "running",
      }
      setCards((prev) => [...replacePendingForm(prev), card])
      if (!toolNeedsForm(tool)) {
        void runTool(id, tool, {})
      }
    },
    [runTool],
  )

  const addResourceCard = useCallback(
    (resource: Resource) => {
      const id = newCardId()
      const card: ResourceCardData = {
        id,
        createdAt: nowIso(),
        kind: "resource",
        resource,
        state: resourceNeedsForm(resource) ? "pending-form" : "running",
      }
      setCards((prev) => [...replacePendingForm(prev), card])
      if (!resourceNeedsForm(resource)) {
        void runResource(id, resource, {})
      }
    },
    [runResource],
  )

  const addPromptCard = useCallback(
    (prompt: Prompt) => {
      const id = newCardId()
      const card: PromptCardData = {
        id,
        createdAt: nowIso(),
        kind: "prompt",
        prompt,
        state: promptNeedsForm(prompt) ? "pending-form" : "running",
        streamed: "",
      }
      setCards((prev) => [...replacePendingForm(prev), card])
      if (!promptNeedsForm(prompt)) {
        void runPromptStub(id, prompt, {})
      }
    },
    [runPromptStub],
  )

  const submitForm = useCallback(
    (id: CardId, args: Record<string, unknown>) => {
      const card = cardsRef.current.find((c) => c.id === id)
      if (!card || card.state !== "pending-form") return
      if (card.kind === "tool") void runTool(id, card.tool, args)
      else if (card.kind === "resource")
        void runResource(id, card.resource, args)
      else void runPromptStub(id, card.prompt, args)
    },
    [runTool, runResource, runPromptStub],
  )

  const cancelForm = useCallback((id: CardId) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return {
    cards,
    addToolCard,
    addResourceCard,
    addPromptCard,
    submitForm,
    cancelForm,
  }
}
