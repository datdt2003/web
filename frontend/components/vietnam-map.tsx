"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { MapPin, ChevronRight } from "lucide-react"
import { regions, ethnicGroups, regionsForEthnic, type RegionId, type Ethnic } from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

const markers: Record<RegionId, { top: string; left: string }> = {
  bac: { top: "16%", left: "43%" },
  trung: { top: "46%", left: "57%" },
  nam: { top: "70%", left: "52%" },
}

export function VietnamMap({ ethnics: propEthnics }: { ethnics?: Ethnic[] }) {
  const [ethnics, setEthnics] = useState<Ethnic[]>(propEthnics || ethnicGroups)
  const [active, setActive] = useState<RegionId | null>(null)

  useEffect(() => {
    if (propEthnics && propEthnics.length > 0) {
      setEthnics(propEthnics)
    }
  }, [propEthnics])

  useEffect(() => {
    fetch("/api/ethnic")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setEthnics(resData.data)
        }
      })
      .catch(() => {})
  }, [])

  function countFor(id: RegionId) {
    return ethnics.filter((e) => regionsForEthnic(e).includes(id)).length
  }

  return (
    <div className="grid items-center gap-8 lg:grid-cols-2">
      <div className="relative mx-auto aspect-square w-full max-w-md">
        <Image
          src="/images/vietnam-map.png"
          alt="Bản đồ Việt Nam"
          fill
          sizes="(max-width: 1024px) 90vw, 40vw"
          className="object-contain"
        />
        {regions.map((r) => {
          const pos = markers[r.id]
          const isActive = active === r.id
          return (
            <Link
              key={r.id}
              href={`/dan-toc?region=${r.id}`}
              onMouseEnter={() => setActive(r.id)}
              onMouseLeave={() => setActive(null)}
              style={{ top: pos.top, left: pos.left }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              aria-label={r.label}
            >
              <span className="relative grid place-items-center">
                <span
                  className={cn(
                    "absolute size-8 rounded-full bg-primary/30 transition-transform",
                    isActive ? "scale-150" : "animate-ping",
                  )}
                />
                <span className="relative grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
                  <MapPin className="size-3.5" />
                </span>
                {isActive && (
                  <span className="absolute bottom-full mb-1 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-medium text-background">
                    {r.short} · {countFor(r.id)} dân tộc
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>

      <div className="space-y-3">
        {regions.map((r) => (
          <Link
            key={r.id}
            href={`/dan-toc?region=${r.id}`}
            onMouseEnter={() => setActive(r.id)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              "group flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary hover:shadow-md",
              active === r.id && "border-primary shadow-md",
            )}
          >
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="size-5" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-foreground">{r.label}</h3>
                <p className="text-sm text-muted-foreground">{countFor(r.id)} dân tộc anh em</p>
              </div>
            </div>
            <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        ))}
      </div>
    </div>
  )
}
