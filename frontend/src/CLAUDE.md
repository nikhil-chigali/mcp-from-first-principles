# CLAUDE.md — frontend/src

Companion app for Post 1 of *mcp-from-first-principles*. Read the project [README](../README.md) first for the user-facing summary; this file captures the non-obvious load-bearing decisions and conventions for working in this code.

## Load-bearing framings (do not violate)

- **No LLM-driven chat composer.** The user invokes tools, resources, and prompts directly from the left rail. There is no freeform input that an LLM routes from. The "chat thread" is a chronological log of invocation results, not a conversation with Claude.
- **Tools and resources never touch the LLM.** Only prompts call Claude (their messages are sent to Claude in the backend, response streams back). Don't blur this.
- **Wire log is pedagogical.** The whole point of the demo is exposing the JSON-RPC protocol underneath. Don't hide it or obscure events.
- **Editorial design**, not consumer chat. Serif for content (`font-serif`), mono for code/identifiers (`font-mono`), sans for chrome (default). No bubbles, no shadows, no gradients, no fully-rounded borders, no colored backgrounds. Distinguish things by typography and a single brand accent (`--brand`, muted deep blue), reserved for active states and the connection indicator.
- **Light mode only, desktop only.** Out of scope: dark mode, mobile breakpoints.

## Architecture

```
App.tsx ──┬── TopBar (connection pill + reconnect ↻ + wire-log toggle)
          └── horizontal flex
              ├── LeftRail        (useServerInfo → PrimitiveList × 3)
              ├── ChatThread      (cards from useChatThread)
              └── WireLogPane?    (right-side, when paneOpen; Esc closes it)
```

- `src/api/index.ts` is the single import surface. It exports `api` (currently `mockApi`) and re-exports types. The real backend swap is a one-line change here.
- `src/api/types.ts` defines the `Api` interface — both mock and the eventual real client must implement it. Modify types here, not in consumers.
- Resources are a discriminated union: `DirectResource` (has `uri`) or `TemplateResource` (has `uriTemplate`). Always discriminate via `isTemplateResource()` *at each use site* — storing the result in a local boolean loses TS narrowing.

## Card state machine (useChatThread)

- Cards: discriminated by `kind` ∈ {tool, resource, prompt}.
- States: `pending-form → running → done | error`. Prompts also have `streaming` between running and done.
- **Only one pending-form card at a time.** Adding a new one replaces the existing one (see `replacePendingForm`). Form lives *in the chat thread* as a card — not in the rail, not in a modal.
- The hook holds invocation orchestration: clicking a no-arg primitive jumps straight to running; clicking an arg-taking one creates a pending-form card; submitting calls the appropriate `run*` function.
- Use `cardsRef.current` (not `cards`) inside `submitForm` to avoid stale-closure issues; the hook updates the ref on each render.

## Renderers (src/components/renderers/)

- **MarkdownRenderer** — `react-markdown` with a `components` map that styles each element directly. **Do NOT introduce `@tailwindcss/typography`** — the per-element styling is intentional for editorial control. The inline-vs-block `code` distinction uses `className.includes("language-")` (react-markdown v10 tags fenced code with `language-*` even without explicit lang).
- **JsonRenderer** — hand-rolled tokenizer (single combined regex). Takes a JS value (`unknown`), not a string. For string JSON, the caller does `JSON.parse` first with a try/catch fallback. **Do NOT replace with `react-syntax-highlighter`, `prismjs`, or `shiki`** — the hand-rolled version is intentional restraint.
- **PdfRenderer** — native `<iframe>` + truncated mono URL + open-in-new-tab link. **Do NOT introduce `pdf.js`, `react-pdf`, or `@react-pdf/renderer`.**
- Cards branch by mime type into the right renderer. Non-matching mimes fall back to a `<pre>` block.

## Styling — Tailwind v4

- No `tailwind.config.js` or `postcss.config.js`. Theme defined via `@theme inline { ... }` in `styles/globals.css`. Plugin loaded by `@tailwindcss/vite` in `vite.config.ts`.
- Use existing CSS variable utilities only: `text-foreground`, `text-muted-foreground`, `text-destructive`, `bg-background`, `bg-muted`, `bg-brand`, `border-border`. **No raw hex values.**
- The `--muted-foreground` (oklch 0.42) and `--border` (oklch 0.86) are intentionally darker than shadcn defaults — they passed a contrast pass. Don't lighten them.
- Opacity modifiers (`text-muted-foreground/80`, `/60`, `/50`) cascade naturally with the darker base; prefer them over new color variables.
- Font stacks: `font-sans` (Geist Variable), `font-serif` (system serif stack), `font-mono` (JetBrains Mono Variable). All loaded via fontsource.

## TypeScript gotchas

- `verbatimModuleSyntax` is on → use `import type` for type-only imports, including `import type { JSX } from "react"` when annotating component return types.
- `noUnusedLocals` / `noUnusedParameters` are strict → underscore-prefix unused parameters or omit imports.
- TS 6 deprecated `baseUrl` → only `paths` in tsconfigs. Don't re-introduce `baseUrl`.

## Conventions for new work

- **No `useState` in card components.** Card data flows in via props; visual UI state (e.g. PromptCard's messages collapse) is the only exception.
- **No `useState` in renderers.** All presentational.
- **Don't use shadcn's `Card` primitive** — wrap card bodies in `<CardShell />` for the editorial kicker + state indicator + left border + error slot.
- **Comments**: only when the *why* is non-obvious. Don't explain *what* the code does — names should carry that. No file-header comments.

## Verification

- For UI/frontend changes, run `npm run dev` and view in browser before claiming done. `npm run build` (tsc + vite) catches types but not UX.
- For internal changes (hooks, types), build is sufficient.
- When dispatching parallel agents (e.g. card or renderer components), spot-check each file before wiring them in.

## Commit conventions

- **No `Co-Authored-By: Claude` trailer.** User memory enforces this — strip if accidentally added.
- Commit messages: imperative subject, brief body explaining *why* if non-obvious. Match the existing log style.

## Backend swap (forthcoming)

The real HTTP backend will live in `../backend/` and proxy to the MCP server in `../mcp_server/`. When it lands, it implements the `Api` interface in `src/api/types.ts` and the swap is one line in `src/api/index.ts`. The mock's realistic delays and JSON-RPC wire log are useful reference — the real client should also emit wire events for parity with the demo.
