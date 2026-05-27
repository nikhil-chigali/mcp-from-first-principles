import {
  isTemplateResource,
  type Prompt,
  type Resource,
  type Tool,
} from "@/api"
import { useServerInfo } from "@/hooks/useServerInfo"
import { PrimitiveList } from "./PrimitiveList"

export type PrimitiveSelection =
  | { kind: "tool"; tool: Tool }
  | { kind: "resource"; resource: Resource }
  | { kind: "prompt"; prompt: Prompt }

interface LeftRailProps {
  onSelect: (selection: PrimitiveSelection) => void
}

function resourceKey(r: Resource): string {
  return isTemplateResource(r) ? r.uriTemplate : r.uri
}

export function LeftRail({ onSelect }: LeftRailProps) {
  const { data, loading, error } = useServerInfo()

  return (
    <aside className="w-[280px] shrink-0 overflow-y-auto border-r border-border bg-background">
      {loading && (
        <p className="px-5 py-5 text-[12px] text-muted-foreground">Loading…</p>
      )}
      {error && (
        <p className="px-5 py-5 text-[12px] text-destructive">
          Failed to load: {error.message}
        </p>
      )}
      {data && (
        <nav className="flex flex-col py-5">
          <PrimitiveList
            title="Tools"
            items={data.tools.map((t) => ({
              key: t.name,
              label: t.name,
              description: t.description,
            }))}
            onSelect={(name) => {
              const tool = data.tools.find((t) => t.name === name)
              if (tool) onSelect({ kind: "tool", tool })
            }}
          />
          <PrimitiveList
            title="Resources"
            items={data.resources.map((r) => ({
              key: resourceKey(r),
              label: resourceKey(r),
              description: r.description,
            }))}
            onSelect={(key) => {
              const resource = data.resources.find((r) => resourceKey(r) === key)
              if (resource) onSelect({ kind: "resource", resource })
            }}
          />
          <PrimitiveList
            title="Prompts"
            items={data.prompts.map((p) => ({
              key: p.name,
              label: p.name,
              description: p.description,
            }))}
            onSelect={(name) => {
              const prompt = data.prompts.find((p) => p.name === name)
              if (prompt) onSelect({ kind: "prompt", prompt })
            }}
          />
        </nav>
      )}
    </aside>
  )
}
