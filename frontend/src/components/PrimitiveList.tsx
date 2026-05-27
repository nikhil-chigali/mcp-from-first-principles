interface PrimitiveItem {
  key: string
  label: string
  description?: string
}

interface PrimitiveListProps {
  title: string
  items: PrimitiveItem[]
  onSelect: (key: string) => void
}

export function PrimitiveList({ title, items, onSelect }: PrimitiveListProps) {
  return (
    <section className="px-5 py-3">
      <h2 className="mb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/80">
        {title}
      </h2>
      {items.length === 0 ? (
        <p className="px-1.5 text-[12px] italic text-muted-foreground/60">
          none
        </p>
      ) : (
        <ul className="-mx-1.5">
          {items.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                onClick={() => onSelect(item.key)}
                title={item.description}
                className="block w-full truncate rounded px-1.5 py-1 text-left font-mono text-[12.5px] text-foreground/80 transition-colors hover:bg-muted hover:text-foreground"
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
