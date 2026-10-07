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
    <div className="flex justify-center">
      <div className="relative mx-auto aspect-square w-full max-w-lg">
        <Image
          src="/images/vietnam-map.png?v=20261007"
          alt="Bản đồ Việt Nam"
          fill
          sizes="(max-width: 1024px) 90vw, 550px"
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
                <span className="relative grid size-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-md transition-transform hover:scale-110">
                  <MapPin className="size-3.5" />
                </span>
                {isActive && (
                  <span className="absolute bottom-full mb-1 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg">
                    {r.short} · {countFor(r.id)} dân tộc
                  </span>
                )}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
