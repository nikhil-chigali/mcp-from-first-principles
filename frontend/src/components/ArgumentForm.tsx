import { useState, type FormEvent, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export interface ArgumentFormField {
  name: string
  type: "string"
  description?: string
  required: boolean
}

interface ArgumentFormProps {
  fields: ArgumentFormField[]
  onSubmit: (args: Record<string, unknown>) => void
  onCancel: () => void
  submitLabel?: string
}

export function ArgumentForm({
  fields,
  onSubmit,
  onCancel,
  submitLabel = "Run",
}: ArgumentFormProps) {
  const [values, setValues] = useState<Record<string, string>>({})
  const [showRequired, setShowRequired] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const missing = fields.filter(
      (f) => f.required && !(values[f.name] ?? "").trim(),
    )
    if (missing.length > 0) {
      setShowRequired(true)
      return
    }
    onSubmit(values)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLFormElement>) => {
    if (e.key === "Escape") {
      e.preventDefault()
      onCancel()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleKeyDown}
      className="flex flex-col gap-3"
    >
      {fields.map((field, i) => {
        const value = values[field.name] ?? ""
        const isMissing =
          showRequired && field.required && !value.trim()
        return (
          <div key={field.name} className="flex flex-col gap-1">
            <label
              htmlFor={`field-${field.name}`}
              className="flex items-baseline gap-2 font-mono text-[11.5px] text-muted-foreground"
            >
              <span>{field.name}</span>
              {field.required && (
                <span
                  className={
                    isMissing
                      ? "text-destructive"
                      : "text-muted-foreground/50"
                  }
                >
                  required
                </span>
              )}
              {field.description && (
                <span className="font-sans text-muted-foreground/60">
                  — {field.description}
                </span>
              )}
            </label>
            <Input
              id={`field-${field.name}`}
              type="text"
              value={value}
              autoFocus={i === 0}
              onChange={(e) =>
                setValues((v) => ({ ...v, [field.name]: e.target.value }))
              }
              className="h-8 font-mono text-[13px]"
            />
          </div>
        )
      })}
      <div className="mt-1 flex items-center gap-2">
        <Button
          type="submit"
          size="sm"
          className="h-7 px-3 text-[12px] font-normal"
        >
          {submitLabel}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-7 px-2 text-[12px] font-normal text-muted-foreground hover:text-foreground"
        >
          Cancel
        </Button>
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground/60">
          esc to cancel
        </span>
      </div>
    </form>
  )
}
