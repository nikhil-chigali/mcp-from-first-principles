// Types shared by the mock and the eventual real backend client.
// Shapes follow the MCP spec where reasonable so swapping implementations is a one-line change.

// --- Primitives -----------------------------------------------------------

export interface JsonSchemaProperty {
  type: "string" | "number" | "integer" | "boolean" | "array" | "object"
  description?: string
}

export interface JsonSchemaObject {
  type: "object"
  properties?: Record<string, JsonSchemaProperty>
  required?: string[]
}

export interface Tool {
  name: string
  description: string
  inputSchema: JsonSchemaObject
}

interface BaseResource {
  name?: string
  description?: string
  mimeType?: string
}

export interface DirectResource extends BaseResource {
  uri: string
}

export interface TemplateResource extends BaseResource {
  uriTemplate: string
}

export type Resource = DirectResource | TemplateResource

export function isTemplateResource(r: Resource): r is TemplateResource {
  return "uriTemplate" in r
}

export interface PromptArgument {
  name: string
  description?: string
  required?: boolean
}

export interface Prompt {
  name: string
  description: string
  arguments: PromptArgument[]
}

// --- Operation results ----------------------------------------------------

export interface ToolCallResult {
  result: unknown
  mimeType: string
  isError: boolean
}

export interface ResourceReadResult {
  // text resources: utf-8 string
  // binary resources (pdf): data URL or remote URL
  content: string
  mimeType: string
}

// --- Server info ----------------------------------------------------------

export type ConnectionState =
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "error"

export interface ServerInfo {
  connected: boolean
  tools: Tool[]
  resources: Resource[]
  prompts: Prompt[]
}

// --- Prompt streaming events ---------------------------------------------

export interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export type PromptEvent =
  | { type: "prompt_messages"; messages: ChatMessage[] }
  | { type: "claude_token"; text: string }
  | { type: "done" }
  | { type: "error"; message: string }

// --- Wire log (JSON-RPC envelopes) ---------------------------------------

export type WireDirection = "→" | "←"

export interface JsonRpcRequest {
  jsonrpc: "2.0"
  id: number
  method: string
  params?: Record<string, unknown>
}

export interface JsonRpcResponse {
  jsonrpc: "2.0"
  id: number
  result: unknown
}

export interface JsonRpcErrorResponse {
  jsonrpc: "2.0"
  id: number
  error: { code: number; message: string; data?: unknown }
}

export interface JsonRpcNotification {
  jsonrpc: "2.0"
  method: string
  params?: Record<string, unknown>
}

export type JsonRpcEnvelope =
  | JsonRpcRequest
  | JsonRpcResponse
  | JsonRpcErrorResponse
  | JsonRpcNotification

export interface WireLogEvent {
  direction: WireDirection
  timestamp: string
  method: string
  body: JsonRpcEnvelope
}

// --- The api surface ------------------------------------------------------

export type Unsubscribe = () => void

export interface Api {
  getServerInfo(): Promise<ServerInfo>
  callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<ToolCallResult>
  readResource(uri: string): Promise<ResourceReadResult>
  invokePrompt(
    name: string,
    args: Record<string, unknown>,
  ): AsyncIterable<PromptEvent>
  subscribeWireLog(handler: (event: WireLogEvent) => void): Unsubscribe
  subscribeConnection(handler: (state: ConnectionState) => void): Unsubscribe
  simulateReconnect(): Promise<void>
}
