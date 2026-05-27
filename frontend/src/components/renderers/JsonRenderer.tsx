import type { JSX } from "react"

interface JsonRendererProps {
  value: unknown
}

interface Token {
  text: string
  className: string
}

const TOKEN_RE = /("(?:\\.|[^"\\])*")(\s*:)?|(\b(?:true|false|null)\b)|(-?\d+(?:\.\d+)?(?:[eE][-+]?\d+)?)|([{}[\],])|(\s+)/g

const PRE_CLASS =
  "overflow-x-auto rounded bg-muted/40 p-3 font-mono text-[12.5px] leading-relaxed text-foreground"

function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  let match: RegExpExecArray | null
  TOKEN_RE.lastIndex = 0
  while ((match = TOKEN_RE.exec(text)) !== null) {
    const [, str, colon, literal, num, punct, ws] = match
    if (str !== undefined) {
      if (colon !== undefined) {
        tokens.push({ text: str, className: "text-foreground" })
        tokens.push({ text: colon, className: "text-muted-foreground/60" })
      } else {
        tokens.push({ text: str, className: "text-emerald-700" })
      }
    } else if (literal !== undefined) {
      tokens.push({ text: literal, className: "text-brand" })
    } else if (num !== undefined) {
      tokens.push({ text: num, className: "text-amber-700" })
    } else if (punct !== undefined) {
      tokens.push({ text: punct, className: "text-muted-foreground/60" })
    } else if (ws !== undefined) {
      tokens.push({ text: ws, className: "" })
    }
  }
  return tokens
}

export function JsonRenderer({ value }: JsonRendererProps): JSX.Element {
  let text: string
  try {
    text = JSON.stringify(value, null, 2)
  } catch {
    return <pre className={PRE_CLASS}>{String(value)}</pre>
  }

  if (text === undefined) {
    return <pre className={PRE_CLASS}>{String(value)}</pre>
  }

  const tokens = tokenize(text)

  return (
    <pre className={PRE_CLASS}>
      <code>
        {tokens.map((tok, i) => (
          <span key={i} className={tok.className}>
            {tok.text}
          </span>
        ))}
      </code>
    </pre>
  )
}
