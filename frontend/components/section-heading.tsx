import { cn } from "@/lib/utils"

export function SectionHeading({
  eyebrow,
  title,
  description,
  center,
  className,
}: {
  eyebrow?: string
  title: string
  description?: string
  center?: boolean
  className?: string
}) {
  return (
    <div className={cn("max-w-2xl", center && "mx-auto text-center", className)}>
      {eyebrow && (
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          <span className="h-px w-6 bg-primary" />
          {eyebrow}
        </span>
      )}
      <h2 className="mt-3 text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}
