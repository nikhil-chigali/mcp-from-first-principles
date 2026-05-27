import type { JSX } from "react"
import ReactMarkdown, { type Components } from "react-markdown"

interface MarkdownRendererProps {
  content: string
}

const components: Components = {
  h1: ({ children }) => (
    <h1 className="font-serif text-[24px] leading-tight font-medium tracking-tight text-foreground mt-6 first:mt-0 mb-3">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="font-serif text-[19px] font-medium text-foreground mt-5 mb-2">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-serif text-[16px] font-medium text-foreground mt-4 mb-2">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="font-serif text-[15px] leading-[1.7] text-foreground mb-3 last:mb-0">
      {children}
    </p>
  ),
  strong: ({ children }) => (
    <strong className="font-medium text-foreground">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground underline decoration-brand decoration-[1.5px] underline-offset-2 hover:bg-brand/10"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-3 pl-6 list-disc list-outside text-foreground">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 pl-6 list-decimal list-outside text-foreground">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="mb-1 font-serif text-[15px] leading-[1.6]">{children}</li>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-l-border pl-4 font-serif italic text-muted-foreground my-3">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="border-0 border-t border-border my-6" />,
  table: ({ children }) => (
    <table className="border-collapse my-3 text-left">{children}</table>
  ),
  th: ({ children }) => (
    <th className="text-[13.5px] font-serif font-medium text-foreground border-b border-border py-2 pr-4">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="text-[13.5px] font-serif text-foreground border-b border-border py-2 pr-4">
      {children}
    </td>
  ),
  pre: ({ children }) => (
    <pre className="overflow-x-auto rounded bg-muted/40 p-3 my-3">{children}</pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock =
      typeof className === "string" && className.includes("language-")
    if (isBlock) {
      return (
        <code
          className="font-mono text-[12.5px] leading-relaxed text-foreground"
          {...props}
        >
          {children}
        </code>
      )
    }
    return (
      <code
        className="font-mono text-[13px] bg-muted/60 rounded px-1 py-0.5 text-foreground"
        {...props}
      >
        {children}
      </code>
    )
  },
}

export function MarkdownRenderer({ content }: MarkdownRendererProps): JSX.Element {
  return (
    <div className="font-serif">
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  )
}
