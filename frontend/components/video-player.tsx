"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"

const DURATION = 90 // giây (mô phỏng)

function fmt(sec: number) {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function parseVideoEmbedUrl(url?: string): { type: "youtube" | "drive" | "video"; src: string } | null {
  if (!url || typeof url !== "string") return null
  const trimmed = url.trim()
  if (!trimmed) return null

  // 1. YouTube
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|shorts\/|watch\?.+&v=))([\w-]{11})/
  )
  if (ytMatch && ytMatch[1]) {
    return {
      type: "youtube",
      src: `https://www.youtube-nocookie.com/embed/${ytMatch[1]}?rel=0&autoplay=0`,
    }
  }

  // 2. Google Drive
  const driveMatch = trimmed.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/)
  if (driveMatch && driveMatch[1]) {
    return {
      type: "drive",
      src: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
    }
  }

  // 3. Direct video (MP4, WebM, local upload)
  return {
    type: "video",
    src: trimmed,
  }
}

export function VideoPlayer({ poster, title, videoUrl }: { poster: string; title: string; videoUrl?: string }) {
  const embed = parseVideoEmbedUrl(videoUrl)

  if (embed) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
        {embed.type === "youtube" || embed.type === "drive" ? (
          <div className="relative aspect-video w-full bg-black">
            <iframe
              src={embed.src}
              title={`Tư liệu văn hóa · Người ${title}`}
              className="absolute inset-0 size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <video
            controls
            poster={poster || undefined}
            className="aspect-video w-full object-cover"
            preload="metadata"
            playsInline
          >
            <source src={embed.src} />
            Trình duyệt của bạn không hỗ trợ phát video.
          </video>
        )}
        <div className="flex items-center justify-between gap-2 bg-card px-4 py-3">
          <p className="text-sm font-medium text-foreground">Tư liệu văn hóa · Người {title}</p>
          <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">HD</span>
        </div>
      </div>
    )
  }
	
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) return
    let last = performance.now()
    const tick = (now: number) => {
      const dt = (now - last) / 1000
      last = now
      setProgress((p) => {
        const next = p + dt
        if (next >= DURATION) {
          setPlaying(false)
          return 0
        }
        return next
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [playing])

  const pct = (progress / DURATION) * 100

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-black shadow-lg">
      <div className="relative aspect-video">
        <Image
          src={poster || "/placeholder.svg"}
          alt={`Video văn hóa ${title}`}
          fill
          sizes="(max-width: 1024px) 100vw, 60vw"
          className={playing ? "object-cover scale-105 transition-transform duration-[3000ms]" : "object-cover"}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20" />

        <button
          type="button"
          onClick={() => setPlaying((v) => !v)}
          aria-label={playing ? "Tạm dừng" : "Phát video"}
          className="absolute inset-0 grid place-items-center"
        >
          <span
            className={`grid size-20 place-items-center rounded-full bg-primary/90 text-primary-foreground shadow-xl backdrop-blur transition-all hover:scale-105 ${
              playing ? "opacity-0" : "opacity-100"
            }`}
          >
            <Play className="size-8 fill-current" />
          </span>
        </button>

        {playing && (
          <span className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
            <span className="size-2 animate-pulse rounded-full bg-gold" />
            Đang phát
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-4">
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/25"
            aria-label={playing ? "Tạm dừng" : "Phát"}
          >
            {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current" />}
          </button>
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/25">
            <div className="h-full rounded-full bg-primary transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <span className="shrink-0 font-mono text-xs text-white/90">
            {fmt(progress)} / {fmt(DURATION)}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 bg-card px-4 py-3">
        <p className="text-sm font-medium text-foreground">
          Tư liệu văn hóa · Người {title}
        </p>
        <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
          HD
        </span>
      </div>
    </div>
  )
}
