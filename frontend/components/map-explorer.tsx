"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { MapPin, Search, Users, ChevronRight, X, Compass } from "lucide-react"
import { Input } from "@/components/ui/input"
import { buttonVariants } from "@/components/ui/button"
import { regions, ethnicGroups, regionsForEthnic, type RegionId, type Ethnic } from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

type PointKey =
  | "taybac"
  | "vietbac"
  | "dongbac"
  | "songhong"
  | "thanhnghe"
  | "hue"
  | "danang"
  | "taynguyen"
  | "namtrung"
  | "dongnam"
  | "mekong"
  | "camau"

// Approximate settlement zones plotted on the square Vietnam map image
// (top / left as a percentage). Each zone is tagged with the miền it belongs to.
const POINTS: Record<PointKey, { top: number; left: number; label: string; region: RegionId }> = {
  taybac: { top: 16, left: 29, label: "Tây Bắc", region: "bac" },
  vietbac: { top: 11, left: 44, label: "Việt Bắc", region: "bac" },
  dongbac: { top: 16, left: 52, label: "Đông Bắc", region: "bac" },
  songhong: { top: 24, left: 45, label: "ĐB sông Hồng", region: "bac" },
  thanhnghe: { top: 31, left: 43, label: "Thanh – Nghệ", region: "trung" },
  hue: { top: 42, left: 54, label: "Quảng Trị – Huế", region: "trung" },
  danang: { top: 47, left: 58, label: "Đà Nẵng – Quảng Nam", region: "trung" },
  taynguyen: { top: 54, left: 52, label: "Tây Nguyên", region: "trung" },
  namtrung: { top: 57, left: 60, label: "Nam Trung Bộ", region: "trung" },
  dongnam: { top: 66, left: 54, label: "Đông Nam Bộ", region: "nam" },
  mekong: { top: 73, left: 48, label: "ĐB sông Cửu Long", region: "nam" },
  camau: { top: 79, left: 45, label: "Cà Mau – Bạc Liêu", region: "nam" },
}

// Default zones for a group whose spread matches its home region.
const regionClusters: Record<RegionId, PointKey[]> = {
  bac: ["taybac", "vietbac", "dongbac", "songhong"],
  trung: ["thanhnghe", "hue", "danang", "taynguyen", "namtrung"],
  nam: ["dongnam", "mekong", "camau"],
}

// Groups whose real distribution spans several regions or specific provinces.
const groupOverrides: Record<string, PointKey[]> = {
  kinh: ["songhong", "thanhnghe", "hue", "danang", "namtrung", "dongnam", "mekong", "camau"],
  hoa: ["dongbac", "songhong", "danang", "dongnam", "mekong"],
  khmer: ["mekong", "camau", "dongnam"],
  cham: ["namtrung", "dongnam", "mekong"],
  hmong: ["taybac", "vietbac", "thanhnghe"],
  thai: ["taybac", "thanhnghe"],
  muong: ["taybac", "songhong", "thanhnghe"],
  tay: ["vietbac", "dongbac"],
  nung: ["vietbac", "dongbac"],
  dao: ["taybac", "vietbac", "dongbac"],
  ngai: ["dongbac", "thanhnghe", "danang", "dongnam", "mekong", "camau"],
  tho: ["thanhnghe"],
  "e-de": ["taynguyen"],
  "gia-rai": ["taynguyen"],
  "ba-na": ["taynguyen"],
}

const regionOrder: RegionId[] = ["bac", "trung", "nam"]

function pointsFor(slug: string, region: RegionId): PointKey[] {
  return groupOverrides[slug] ?? regionClusters[region]
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
}

export function MapExplorer({ initialEthnics }: { initialEthnics?: Ethnic[] }) {
  const [ethnics, setEthnics] = useState<Ethnic[]>(initialEthnics || ethnicGroups)
  const [query, setQuery] = useState("")
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)

  useEffect(() => {
    if (initialEthnics && initialEthnics.length > 0) {
      setEthnics(initialEthnics)
    }
  }, [initialEthnics])

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

  const selected = useMemo(
    () => ethnics.find((e) => e.slug === selectedSlug) ?? null,
    [ethnics, selectedSlug],
  )

  const results = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return []
    return ethnics
      .filter((e) => normalize(e.name).includes(q) || (e.altNames && normalize(e.altNames).includes(q)))
      .slice(0, 8)
  }, [ethnics, query])

  const activePoints = useMemo(() => {
    if (!selected) return []
    const points = selected.slug in groupOverrides
      ? pointsFor(selected.slug, selected.region)
      : regionsForEthnic(selected).flatMap((region) => regionClusters[region])
    return [...new Set(points)].map((k) => POINTS[k])
  }, [selected])

  const activeRegions = useMemo(() => {
    const set = new Set(activePoints.map((p) => p.region))
    return regionOrder.filter((r) => set.has(r))
  }, [activePoints])

  const regionText =
    activeRegions.length === 3
      ? "Cả ba miền Bắc – Trung – Nam"
      : activeRegions.map((r) => regions.find((x) => x.id === r)?.label).join(", ")

  function pick(slug: string, name: string) {
    setSelectedSlug(slug)
    setQuery(name)
  }

  function clear() {
    setSelectedSlug(null)
    setQuery("")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-start">
      {/* Controls + info */}
      <div className="space-y-5">
        {/* Search */}
        <div className="relative">
          <label className="mb-2 block text-sm font-semibold text-foreground">
            Tìm một dân tộc để xem vùng phân bố
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setSelectedSlug(null)
              }}
              placeholder="Ví dụ: H'Mông, Tày, Chăm, Khmer…"
              className="pl-9 pr-9"
              aria-label="Tìm dân tộc"
            />
            {query && (
              <button
                type="button"
                onClick={clear}
                aria-label="Xóa"
                className="absolute right-2 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {results.length > 0 && !selected && (
            <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg">
              {results.map((e) => (
                <li key={e.slug}>
                  <button
                    type="button"
                    onClick={() => pick(e.slug, e.name)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-muted"
                  >
                    <span className="relative size-9 shrink-0 overflow-hidden rounded-md">
                      <Image src={e.image} alt={e.name} fill sizes="36px" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {e.name}
                        {e.altNames && (
                          <span className="text-muted-foreground"> · {e.altNames}</span>
                        )}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {regionsForEthnic(e).map((region) => regions.find((r) => r.id === region)?.label).join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selected info OR prompt */}
        {selected ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex gap-4 p-4">
              <span className="relative size-20 shrink-0 overflow-hidden rounded-xl">
                <Image src={selected.image} alt={selected.name} fill sizes="80px" className="object-cover" />
              </span>
              <div className="min-w-0">
                <h3 className="font-serif text-xl font-bold text-foreground">
                  {selected.name}
                  {selected.altNames && (
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      ({selected.altNames})
                    </span>
                  )}
                </h3>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="size-4 text-primary" />
                  {selected.population.toLocaleString("vi-VN")} người
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Ngữ hệ {selected.languageFamily}
                </p>
              </div>
            </div>

            <div className="border-t border-border bg-primary/5 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                <MapPin className="size-4" />
                Tập trung ở {regionText}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {activePoints.map((p) => (
                  <span
                    key={p.label}
                    className="rounded-full border border-primary/30 bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                  >
                    {p.label}
                  </span>
                ))}
              </div>
              <Link
                href={`/dan-toc/${selected.slug}`}
                className={cn(buttonVariants({ size: "sm" }), "mt-3 bg-primary text-primary-foreground")}
              >
                Xem chi tiết &amp; video
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-dashed border-border bg-muted/40 p-4">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <Compass className="size-5" />
            </span>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Nhập tên một dân tộc để xem những vùng họ sinh sống nhiều nhất
              được đánh dấu trên bản đồ. Có dân tộc chỉ ở một vùng, có dân tộc như
              người Kinh trải khắp cả ba miền.
            </p>
          </div>
        )}
      </div>

      {/* Flat map with distribution points */}
      <div className="rounded-3xl border border-border bg-gradient-to-b from-muted/50 to-background p-4 sm:p-6">
        <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-2xl border border-border bg-background">
          <Image
            src="/images/vietnam-map.png?v=20261007"
            alt="Bản đồ Việt Nam"
            fill
            sizes="(max-width: 1024px) 90vw, 40vw"
            className="object-contain"
            priority
          />

          {/* Distribution points for the selected group */}
          {activePoints.map((p, i) => (
            <span
              key={p.label}
              style={{ top: `${p.top}%`, left: `${p.left}%`, animationDelay: `${i * 90}ms` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <span className="relative grid place-items-center">
                <span className="absolute size-6 animate-ping rounded-full bg-primary/40" />
                <span className="relative size-2.5 rounded-full bg-primary ring-2 ring-primary-foreground shadow" />
              </span>
            </span>
          ))}

          {/* Idle overlay hint */}
          {!selected && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-gradient-to-t from-background/90 to-transparent p-4 text-xs font-medium text-muted-foreground">
              <MapPin className="size-4 text-primary" />
              Chọn một dân tộc để xem vùng phân bố
            </div>
          )}

          {/* Selected caption */}
          {selected && (
            <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background shadow">
              {selected.name} · {activePoints.length} vùng
            </div>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          {selected
            ? "Mỗi điểm đỏ là một vùng người " + selected.name + " sinh sống tập trung."
            : "Các điểm đỏ sẽ hiện lên tại những vùng dân tộc được chọn sinh sống nhiều nhất."}
        </p>
      </div>
    </div>
  )
}
