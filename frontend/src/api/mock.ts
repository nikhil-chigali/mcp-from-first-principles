import type {
  Api,
  ChatMessage,
  ConnectionState,
  Prompt,
  PromptEvent,
  Resource,
  ResourceReadResult,
  ServerInfo,
  Tool,
  ToolCallResult,
  Unsubscribe,
  WireLogEvent,
} from "./types"

// --- Fake data ------------------------------------------------------------

interface Paper {
  id: string
  title: string
  authors: string[]
  abstract: string
}

const papers: Paper[] = [
  {
    id: "2403.07814",
    title:
      "Calibrated Self-Consistency Improves Long-Horizon Reasoning in Large Language Models",
    authors: ["Anika Verma", "Lukas Bauer", "Mei-Ling Chen"],
    abstract:
      "Long-horizon reasoning tasks expose a persistent gap between single-sample accuracy and majority-vote ceiling. We introduce calibrated self-consistency (CSC), which re-weights sampled trajectories by a small verifier trained on intermediate-state agreement rather than final-answer match. On GSM-Hard, ARC-Challenge-Multistep, and a new 50-turn planning benchmark, CSC closes 38–61% of the gap to the oracle ceiling with no additional fine-tuning of the base model.",
  },
  {
    id: "2402.18441",
    title: "Sparse Attention Through Adaptive Token Pruning",
    authors: ["Hideo Tanaka", "Priya Iyer"],
    abstract:
      "We study attention sparsity as a function of input difficulty rather than position. Our method learns a per-head pruning policy that retains a context-sensitive subset of tokens for each query, achieving 2.3x throughput on a 32B-parameter model with under 1% degradation on MMLU and GSM8K. Unlike fixed-window or strided patterns, the policy is differentiable end-to-end and requires no manual schedule.",
  },
  {
    id: "2401.09954",
    title: "On the Geometry of Reward Model Disagreement in RLHF",
    authors: ["Marcus Holloway", "Sara Khouri", "Diego Ramos"],
    abstract:
      "Reward models trained on the same human preference data routinely disagree on out-of-distribution completions, but the structure of that disagreement is poorly understood. We characterize the disagreement manifold using a kernel decomposition over the policy's hidden states and show that most disagreement concentrates in a low-dimensional subspace correlated with stylistic rather than semantic shifts. We propose a simple projection-based aggregation that reduces reward hacking incidents by 47% across three open-source policies.",
  },
]

// --- Static primitive listings -------------------------------------------

const tools: Tool[] = [
  {
    name: "get_papers_of_the_day",
    description:
      "Returns the curated list of papers chosen for today, including title, authors, and abstract.",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "save_arxiv",
    description:
      "Save a paper to your library by arXiv ID or full arXiv URL.",
    inputSchema: {
      type: "object",
      properties: {
        arxiv_id_or_url: {
          type: "string",
          description: "An arXiv ID (e.g. 2401.09954) or full arXiv URL.",
        },
      },
      required: ["arxiv_id_or_url"],
    },
  },
]

const resources: Resource[] = [
  {
    uri: "papers://list",
    name: "Saved papers",
    description: "JSON list of every paper currently in your library.",
    mimeType: "application/json",
  },
  {
    uriTemplate: "papers://{id}/pdf",
    name: "Paper PDF",
    description: "The full PDF of a saved paper by arXiv id.",
    mimeType: "application/pdf",
  },
  {
    uriTemplate: "papers://{id}/markdown",
    name: "Paper summary (markdown)",
    description: "Title, authors, and abstract of a saved paper as markdown.",
    mimeType: "text/markdown",
  },
]

const prompts: Prompt[] = [
  {
    name: "explain",
    description:
      "Explain a saved paper in plain language for a non-specialist reader.",
    arguments: [
      {
        name: "arxiv_id",
        description: "arXiv ID of a paper already in your library.",
        required: true,
      },
    ],
  },
  {
    name: "newsletter",
    description:
      "Compose a short newsletter blurb summarizing the papers in your library.",
    arguments: [],
  },
]

// --- Tiny emitter ---------------------------------------------------------

function makeEmitter<T>() {
  const listeners = new Set<(value: T) => void>()
  return {
    emit(value: T) {
      for (const fn of listeners) fn(value)
    },
    subscribe(fn: (value: T) => void): Unsubscribe {
      listeners.add(fn)
      return () => {
        listeners.delete(fn)
      }
    },
  }
}

const wireLog = makeEmitter<WireLogEvent>()
const connection = makeEmitter<ConnectionState>()
let connectionState: ConnectionState = "connected"

// --- Helpers --------------------------------------------------------------

let nextRequestId = 0
const newId = () => ++nextRequestId
const nowIso = () => new Date().toISOString()
const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))
const jitter = (min: number, max: number) =>
  delay(min + Math.random() * (max - min))

function logRequest(method: string, params: Record<string, unknown>): number {
  const id = newId()
  wireLog.emit({
    direction: "→",
    timestamp: nowIso(),
    method,
    body: { jsonrpc: "2.0", id, method, params },
  })
  return id
}

function logResponse(id: number, method: string, result: unknown): void {
  wireLog.emit({
    direction: "←",
    timestamp: nowIso(),
    method,
    body: { jsonrpc: "2.0", id, result },
  })
}

function logError(
  id: number,
  method: string,
  code: number,
  message: string,
): void {
  wireLog.emit({
    direction: "←",
    timestamp: nowIso(),
    method,
    body: { jsonrpc: "2.0", id, error: { code, message } },
  })
}

// --- Primitive implementations -------------------------------------------

async function getServerInfo(): Promise<ServerInfo> {
  // Mimic the MCP init handshake: initialize → list tools → list resources → list templates → list prompts.
  const initId = logRequest("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "mcp-from-first-principles-frontend", version: "0.0.1" },
  })
  await jitter(80, 160)
  logResponse(initId, "initialize", {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {}, resources: {}, prompts: {} },
    serverInfo: { name: "papers-mcp-mock", version: "0.0.1" },
  })

  const toolsId = logRequest("tools/list", {})
  await jitter(30, 80)
  logResponse(toolsId, "tools/list", { tools })

  const resourcesId = logRequest("resources/list", {})
  await jitter(30, 80)
  logResponse(resourcesId, "resources/list", {
    resources: resources.filter((r): r is Resource & { uri: string } =>
      "uri" in r,
    ),
  })

  const templatesId = logRequest("resources/templates/list", {})
  await jitter(30, 80)
  logResponse(templatesId, "resources/templates/list", {
    resourceTemplates: resources.filter(
      (r): r is Resource & { uriTemplate: string } => "uriTemplate" in r,
    ),
  })

  const promptsId = logRequest("prompts/list", {})
  await jitter(30, 80)
  logResponse(promptsId, "prompts/list", { prompts })

  return {
    connected: connectionState === "connected",
    tools,
    resources,
    prompts,
  }
}

async function callTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolCallResult> {
  const id = logRequest("tools/call", { name, arguments: args })
  await jitter(220, 420)

  if (name === "get_papers_of_the_day") {
    logResponse(id, "tools/call", {
      content: [{ type: "text", text: JSON.stringify(papers) }],
      isError: false,
    })
    return { result: papers, mimeType: "application/json", isError: false }
  }

  if (name === "save_arxiv") {
    const arxivId = String(args.arxiv_id_or_url ?? "").trim()
    if (!arxivId) {
      logError(id, "tools/call", -32602, "missing arxiv_id_or_url")
      return {
        result: { error: "missing arxiv_id_or_url" },
        mimeType: "application/json",
        isError: true,
      }
    }
    const cleanId = arxivId.replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//, "")
      .replace(/\.pdf$/, "")
    const result = {
      status: "saved" as const,
      arxiv_id: cleanId,
      message: `Saved paper ${cleanId} to your library.`,
    }
    logResponse(id, "tools/call", {
      content: [{ type: "text", text: JSON.stringify(result) }],
      isError: false,
    })
    return { result, mimeType: "application/json", isError: false }
  }

  logError(id, "tools/call", -32601, `Unknown tool: ${name}`)
  return {
    result: { error: `Unknown tool: ${name}` },
    mimeType: "application/json",
    isError: true,
  }
}

async function readResource(uri: string): Promise<ResourceReadResult> {
  const id = logRequest("resources/read", { uri })
  await jitter(160, 320)

  if (uri === "papers://list") {
    const content = JSON.stringify(papers, null, 2)
    logResponse(id, "resources/read", {
      contents: [{ uri, mimeType: "application/json", text: content }],
    })
    return { content, mimeType: "application/json" }
  }

  const pdfMatch = uri.match(/^papers:\/\/([^/]+)\/pdf$/)
  if (pdfMatch) {
    const arxivId = pdfMatch[1]
    const paper = papers.find((p) => p.id === arxivId)
    if (paper) {
      // Real arXiv hosts a public PDF; the mock points at it instead of streaming bytes.
      const pdfUrl = `https://arxiv.org/pdf/${arxivId}.pdf`
      logResponse(id, "resources/read", {
        contents: [
          { uri, mimeType: "application/pdf", blob: "<binary-elided>" },
        ],
      })
      return { content: pdfUrl, mimeType: "application/pdf" }
    }
  }

  const mdMatch = uri.match(/^papers:\/\/([^/]+)\/markdown$/)
  if (mdMatch) {
    const arxivId = mdMatch[1]
    const paper = papers.find((p) => p.id === arxivId)
    if (paper) {
      const markdown =
        `# ${paper.title}\n\n` +
        `**Authors:** ${paper.authors.join(", ")}  \n` +
        `**arXiv:** [${paper.id}](https://arxiv.org/abs/${paper.id})\n\n` +
        `## Abstract\n\n${paper.abstract}\n`
      logResponse(id, "resources/read", {
        contents: [{ uri, mimeType: "text/markdown", text: markdown }],
      })
      return { content: markdown, mimeType: "text/markdown" }
    }
  }

  logError(id, "resources/read", -32602, `Resource not found: ${uri}`)
  throw new Error(`Resource not found: ${uri}`)
}

async function* invokePrompt(
  name: string,
  args: Record<string, unknown>,
): AsyncIterableIterator<PromptEvent> {
  const id = logRequest("prompts/get", { name, arguments: args })
  await jitter(180, 360)

  let messages: ChatMessage[]
  let response: string

  if (name === "explain") {
    const arxivId = String(args.arxiv_id ?? "").trim()
    const paper = papers.find((p) => p.id === arxivId)
    if (!paper) {
      logError(id, "prompts/get", -32602, `Unknown arxiv_id: ${arxivId}`)
      yield {
        type: "error",
        message: `No saved paper with arxiv_id "${arxivId}". Try one of: ${papers.map((p) => p.id).join(", ")}.`,
      }
      return
    }
    messages = [
      {
        role: "user",
        content:
          `Please explain the paper "${paper.title}" by ${paper.authors.join(", ")} (arXiv:${paper.id}) ` +
          `in plain language for a non-specialist reader. Cover what problem it tackles, what's new about ` +
          `the approach, and what the headline result means. Keep it under 200 words.\n\n` +
          `Abstract:\n${paper.abstract}`,
      },
    ]
    response =
      `The paper looks at a specific weakness that shows up when large language models are asked to ` +
      `reason over many steps: their best answer is often hiding among the samples they generate, but the ` +
      `usual trick — take a majority vote — isn't smart enough to find it. The authors propose ` +
      `**calibrated self-consistency**, which trains a small verifier to score not the final answer but the ` +
      `quality of the intermediate reasoning, then uses that score to weight the vote.\n\n` +
      `The headline result is that on hard reasoning benchmarks they close roughly half the gap between ` +
      `naive majority voting and an oracle that always picks the best sample. They achieve this without ` +
      `fine-tuning the underlying model, which makes the method cheap to bolt onto existing systems. The ` +
      `interesting subtlety is that the verifier judges agreement *across* trajectories at intermediate ` +
      `steps, not just at the answer — that's what lets it catch flawed reasoning that happens to land on ` +
      `the right number.`
  } else if (name === "newsletter") {
    messages = [
      {
        role: "user",
        content:
          `Write a one-paragraph newsletter blurb covering the ${papers.length} papers currently in the ` +
          `library. Group them by theme if natural, and end with one sentence pointing readers to whichever ` +
          `one is most worth reading first.\n\n` +
          `Papers:\n${papers.map((p) => `- ${p.id}: ${p.title} (${p.authors.join(", ")})`).join("\n")}`,
      },
    ]
    response =
      `This week's library leans toward the unglamorous middle of the ML stack: making the systems we ` +
      `already have work better, rather than reaching for new architectures. Verma et al. revisit ` +
      `self-consistency for multi-step reasoning and squeeze out gains by scoring intermediate trajectories ` +
      `rather than final answers; Tanaka and Iyer make a similar bet on sparse attention, learning a ` +
      `query-conditioned pruning policy that buys real throughput without measurable accuracy loss; and ` +
      `Holloway et al. look at why reward models trained on the same data disagree, finding that the ` +
      `disagreement is mostly stylistic rather than semantic — and exploiting that to cut reward-hacking ` +
      `incidents nearly in half. **Start with Holloway et al.** if you only have time for one: the ` +
      `geometric framing of reward-model disagreement is the most generative idea of the three.`
  } else {
    logError(id, "prompts/get", -32601, `Unknown prompt: ${name}`)
    yield { type: "error", message: `Unknown prompt: ${name}` }
    return
  }

  logResponse(id, "prompts/get", {
    description: prompts.find((p) => p.name === name)?.description,
    messages: messages.map((m) => ({
      role: m.role,
      content: { type: "text", text: m.content },
    })),
  })

  yield { type: "prompt_messages", messages }

  // Backend now hands `messages` to Claude. That call is NOT JSON-RPC, so nothing
  // goes on the wire log — we only stream the tokens up to the frontend.
  const chunks = response.split(/(\s+)/).filter((c) => c.length > 0)
  for (const chunk of chunks) {
    await jitter(40, 110)
    yield { type: "claude_token", text: chunk }
  }

  yield { type: "done" }
}

async function simulateReconnect(): Promise<void> {
  connectionState = "reconnecting"
  connection.emit("reconnecting")
  await jitter(600, 1000)
  connectionState = "connected"
  connection.emit("connected")
}

// --- Exported api ---------------------------------------------------------

export const mockApi: Api = {
  getServerInfo,
  callTool,
  readResource,
  invokePrompt,
  subscribeWireLog: (handler) => wireLog.subscribe(handler),
  subscribeConnection: (handler) => {
    handler(connectionState)
    return connection.subscribe(handler)
  },
  simulateReconnect,
}
