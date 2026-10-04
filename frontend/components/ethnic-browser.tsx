"use client"

import { useSearchParams } from "next/navigation"
import { useMemo, useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { EthnicCard } from "@/components/ethnic-card"
import { ethnicGroups, regions, regionsForEthnic, type RegionId, type Ethnic } from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

type Filter = RegionId | "all"

interface EthnicBrowserProps {
  initialEthnics?: Ethnic[]
}

export function EthnicBrowser({ initialEthnics }: EthnicBrowserProps) {
  const params = useSearchParams()
  const [ethnics, setEthnics] = useState<Ethnic[]>(initialEthnics || ethnicGroups)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (initialEthnics && initialEthnics.length > 0) {
      setEthnics(initialEthnics)
    }
  }, [initialEthnics])

  useEffect(() => {
    // Luôn fetch client-side để đồng bộ ngay khi admin vừa chỉnh sửa
    fetch("/api/ethnic")
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.success && Array.isArray(resData.data) && resData.data.length > 0) {
          setEthnics(resData.data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const r = params.get("region") as Filter | null
    if (r && (r === "all" || regions.some((x) => x.id === r))) {
      setFilter(r)
    }
  }, [params])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ethnics
      .filter((e) => {
        const okRegion = filter === "all" || regionsForEthnic(e).includes(filter)
        const okQuery =
          !q ||
          e.name.toLowerCase().includes(q) ||
          (e.altNames?.toLowerCase().includes(q) ?? false)
        return okRegion && okQuery
      })
      .sort((a, b) => b.population - a.population)
  }, [ethnics, filter, query])

  const tabs: { id: Filter; label: string }[] = [
    { id: "all", label: "Tất cả" },
    ...regions.map((r) => ({ id: r.id as Filter, label: r.short })),
  ]

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setFilter(t.id)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                filter === t.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground/80 hover:border-primary hover:text-primary",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm dân tộc..."
            className="pl-9"
          />
        </div>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        Hiển thị <span className="font-semibold text-foreground">{list.length}</span> dân tộc
      </p>

      {list.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {list.map((e) => (
            <EthnicCard key={e.slug} ethnic={e} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="font-serif text-lg font-semibold text-foreground">
            Không tìm thấy dân tộc phù hợp
          </p>
          <p className="mt-1 text-sm text-muted-foreground">Thử từ khóa hoặc vùng miền khác.</p>
        </div>
      )}
    </div>
  )
}
