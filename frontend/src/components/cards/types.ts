import type {
  ChatMessage,
  Prompt,
  Resource,
  ResourceReadResult,
  Tool,
  ToolCallResult,
} from "@/api"

export type CardId = string

export type CardState =
  | "pending-form"
  | "running"
  | "streaming"
  | "done"
  | "error"

interface BaseCard {
  id: CardId
  createdAt: string
}

export interface ToolCardData extends BaseCard {
  kind: "tool"
  tool: Tool
  state: "pending-form" | "running" | "done" | "error"
  args?: Record<string, unknown>
  result?: ToolCallResult
  error?: string
}

export interface ResourceCardData extends BaseCard {
  kind: "resource"
  resource: Resource
  state: "pending-form" | "running" | "done" | "error"
  args?: Record<string, unknown>
  resolvedUri?: string
  result?: ResourceReadResult
  error?: string
}

export interface PromptCardData extends BaseCard {
  kind: "prompt"
  prompt: Prompt
  state: "pending-form" | "running" | "streaming" | "done" | "error"
  args?: Record<string, unknown>
  messages?: ChatMessage[]
  streamed: string
  error?: string
}

export type Card = ToolCardData | ResourceCardData | PromptCardData
