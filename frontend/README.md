# Frontend — Post 1 MCP demo

Companion app for Post 1 of *mcp-from-first-principles*, a four-post series that teaches the Model Context Protocol by building a small papers-library client on top of it.

The UI is a three-region SPA: a **left rail** listing the MCP primitives the server exposes, a **chat thread** of invocation cards, and an optional **wire log** pane showing the JSON-RPC traffic underneath. There is no LLM-driven chat composer — the user invokes tools, resources, and prompts directly from the rail. Prompts are the only path that involves Claude, and the response streams into the card.

## Quick start

```bash
npm install
npm run dev    # http://localhost:5173
npm run build  # tsc + vite build
```

The frontend runs against a mock backend in `src/api/mock.ts` that returns plausible paper data and emits realistic JSON-RPC envelopes for the wire log. The real backend swap is a one-liner in `src/api/index.ts`.

## Stack

- React 19 + TypeScript, built with Vite
- Tailwind v4 with shadcn/ui (Radix primitives, Nova preset)
- `react-markdown` for prompt responses; hand-rolled tokenizer for JSON syntax highlighting; native `<iframe>` for PDFs
- No global state library — local `useState` and a handful of small hooks

## Layout

```
src/
├── App.tsx                       top-bar + three-region composition
├── api/
│   ├── types.ts                  MCP-shaped types (Tool, Resource, Prompt, …)
│   ├── mock.ts                   mock backend, fake data, JSON-RPC simulation
│   └── index.ts                  api surface; swap mock ↔ real here
├── components/
│   ├── LeftRail.tsx              discovered primitives
│   ├── PrimitiveList.tsx
│   ├── ArgumentForm.tsx          used inside form-pending cards
│   ├── ChatThread.tsx            cards + auto-scroll + jump-to-latest
│   ├── WireLogPane.tsx           right-side JSON-RPC inspector
│   ├── cards/                    ToolCard, ResourceCard, PromptCard, CardShell
│   └── renderers/                MarkdownRenderer, JsonRenderer, PdfRenderer
├── hooks/                        useServerInfo, useChatThread, useWireLog, useConnectionState
└── styles/globals.css            Tailwind v4 theme + brand variable
```

## Notes

- Light mode only and desktop-only by intent — this is a teaching demo, not a product.
- The real HTTP backend (forthcoming in `../backend/`) will talk to an MCP server (Python work-in-progress in `../mcp_server/`).
- The wire log button (top right) toggles a right-side pane showing every JSON-RPC envelope the client and server exchange, with collapsible bodies. The whole point of the demo is being able to see the protocol underneath.
