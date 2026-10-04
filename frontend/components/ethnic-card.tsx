import Link from "next/link"
import Image from "next/image"
import { Play, Users } from "lucide-react"
import { type Ethnic, ethnicGroups } from "@/lib/ethnic-data"

export function EthnicCard({ ethnic }: { ethnic: Ethnic }) {
  return (
    <Link
      href={`/dan-toc/${ethnic.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={ethnic.image || ethnicGroups.find((g) => g.slug === ethnic.slug)?.image || "/images/ethnic-kinh.png"}
          alt={`Người ${ethnic.name}`}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-gold text-gold-foreground opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          <Play className="size-4 fill-current" />
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-bold text-foreground">{ethnic.name}</h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {ethnic.blurb}
        </p>
        <span className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <Users className="size-3.5" />
          {ethnic.population.toLocaleString("vi-VN")} người
        </span>
      </div>
    </Link>
  )
}
