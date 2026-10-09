"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  X,
  Check,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Move,
  Maximize2,
  Minimize2,
  RefreshCw,
  Loader2,
  Sliders,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageCropperModalProps {
  isOpen: boolean
  imageUrl: string
  aspectRatio?: number // default 1 (vuông 1:1)
  title?: string
  backendUrl?: string
  onClose: () => void
  onApply: (newImageUrl: string) => void
}

function normalizeImageUrl(url: string): string {
  if (!url) return ""
  // Chuyển link localhost:5000/uploads hoặc backend/uploads thành đường dẫn API chuẩn /api/upload
  if (url.includes("/uploads/")) {
    const filename = url.split("/uploads/").pop()
    if (filename) return `/api/upload/${filename}`
  }
  return url
}

export function ImageCropperModal({
  isOpen,
  imageUrl,
  aspectRatio = 1,
  title = "Căn chỉnh & Cắt cúp ảnh",
  backendUrl = "http://localhost:5000",
  onClose,
  onApply,
}: ImageCropperModalProps) {
  const [aspect, setAspect] = useState<number>(aspectRatio)
  const [displayUrl, setDisplayUrl] = useState<string>("")
  const [triedProxy, setTriedProxy] = useState(false)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover")
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const [isProcessing, setIsProcessing] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  // Reset state when modal opens with a new image
  useEffect(() => {
    if (isOpen && imageUrl) {
      const normalized = normalizeImageUrl(imageUrl)
      setDisplayUrl(normalized)
      setTriedProxy(false)
      setAspect(aspectRatio)
      setScale(1)
      setPosition({ x: 0, y: 0 })
      setRotation(0)
      setFitMode("cover")
      setIsProcessing(false)
      setImgError(false)
      setErrorMessage(null)
    }
  }, [isOpen, imageUrl, aspectRatio])

  // Xử lý lỗi load ảnh xem trước: Thử proxy server-side trước khi báo lỗi
  const handleImgError = () => {
    if (!triedProxy && displayUrl && !displayUrl.startsWith("data:") && !displayUrl.startsWith("blob:")) {
      setTriedProxy(true)
      const proxyUrl = `/api/upload/proxy?url=${encodeURIComponent(displayUrl)}`
      setDisplayUrl(proxyUrl)
    } else {
      setImgError(true)
    }
  }

  // Mouse & Touch drag handling
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      })
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    })
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
  }

  // Quick positioning buttons
  const alignTo = (direction: "top" | "center" | "bottom" | "left" | "right") => {
    if (!containerRef.current || !imgRef.current) return
    const container = containerRef.current.getBoundingClientRect()
    const img = imgRef.current.getBoundingClientRect()

    const maxShiftY = Math.max(0, (img.height - container.height) / 2)
    const maxShiftX = Math.max(0, (img.width - container.width) / 2)

    switch (direction) {
      case "top":
        setPosition((prev) => ({ ...prev, y: maxShiftY }))
        break
      case "bottom":
        setPosition((prev) => ({ ...prev, y: -maxShiftY }))
        break
      case "center":
        setPosition({ x: 0, y: 0 })
        break
      case "left":
        setPosition((prev) => ({ ...prev, x: maxShiftX }))
        break
      case "right":
        setPosition((prev) => ({ ...prev, x: -maxShiftX }))
        break
    }
  }

  const resetAll = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
    setFitMode("cover")
  }

  // Handle Export and Apply
  const handleApply = async () => {
    if (!imageUrl || isProcessing) return
    setIsProcessing(true)

    try {
      const targetSrc = displayUrl || normalizeImageUrl(imageUrl)

      // Create offscreen image
      const img = new Image()
      img.crossOrigin = "anonymous"

      // Handle loading with CORS, fallback to proxy
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve()
        img.onerror = () => {
          // If crossOrigin fails or remote host blocks CORS, load through server proxy
          const proxySrc = `/api/upload/proxy?url=${encodeURIComponent(targetSrc)}`
          const retryImg = new Image()
          retryImg.crossOrigin = "anonymous"
          retryImg.onload = () => {
            img.src = retryImg.src
            resolve()
          }
          retryImg.onerror = (e) => reject(e)
          retryImg.src = proxySrc
        }
        img.src = targetSrc
      })

      const canvas = document.createElement("canvas")
      const outputSize = 800
      canvas.width = outputSize
      canvas.height = Math.round(outputSize / aspect)

      const ctx = canvas.getContext("2d")
      if (!ctx) throw new Error("Canvas context is not available")

      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"

      // Fill background (white or transparent)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Calculate transformations
      const containerW = containerRef.current?.clientWidth || 360
      const containerH = containerRef.current?.clientHeight || 360
      const scaleMultiplier = outputSize / containerW

      ctx.save()

      // Translate to canvas center
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Apply User Position
      ctx.translate(position.x * scaleMultiplier, position.y * scaleMultiplier)

      // Apply User Rotation
      ctx.rotate((rotation * Math.PI) / 180)

      // Apply User Scale & Base Scale
      const baseRatio = Math.max(containerW / img.naturalWidth, containerH / img.naturalHeight)
      const containRatio = Math.min(containerW / img.naturalWidth, containerH / img.naturalHeight)
      const activeRatio = fitMode === "cover" ? baseRatio : containRatio

      const drawW = img.naturalWidth * activeRatio * scale * scaleMultiplier
      const drawH = img.naturalHeight * activeRatio * scale * scaleMultiplier

      ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH)

      ctx.restore()

      // Export canvas to Blob
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), "image/jpeg", 0.90)
      })

      if (blob) {
        // Tải ảnh đã căn chỉnh lên hệ thống lưu trữ MongoDB Atlas
        try {
          const formData = new FormData()
          const file = new File([blob], `adjusted-${Date.now()}.jpg`, { type: "image/jpeg" })
          formData.append("file", file)

          // Ưu tiên lưu vào /api/upload của Next.js (lưu trực tiếp MongoDB Atlas, dùng link relative)
          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          }).catch(() => fetch(`${backendUrl}/api/upload`, { method: "POST", body: formData }))

          if (res && res.ok) {
            const data = await res.json()
            if (data.url) {
              onApply(data.url)
              onClose()
              return
            }
          }
        } catch (uploadErr) {
          console.warn("Upload adjusted image failed, fallback to data URL:", uploadErr)
        }

        // Fallback sang data URL
        const dataUrl = canvas.toDataURL("image/jpeg", 0.90)
        onApply(dataUrl)
        onClose()
      } else {
        const dataUrl = canvas.toDataURL("image/jpeg", 0.90)
        onApply(dataUrl)
        onClose()
      }
    } catch (err: any) {
      console.error("Apply crop error:", err)
      setErrorMessage("Không thể căn chỉnh ảnh này do hạn chế bản quyền ảnh nguồn. Bạn có thể tải trực tiếp ảnh về máy rồi upload lại.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md animate-in fade-in-50">
      <div className="relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary">
              <Sliders className="size-4" />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold text-foreground">{title}</h3>
              <p className="text-[11px] text-muted-foreground">Kéo di chuyển hoặc phóng to để chọn góc ảnh đẹp nhất</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mx-5 mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMessage}</div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="ml-auto text-destructive/70 hover:text-destructive"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}

        {/* Body / Crop Viewport */}
        <div className="flex flex-1 flex-col items-center justify-center p-5 bg-muted/30">
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              aspectRatio: `${aspect}`,
            }}
            className="relative h-64 sm:h-72 max-w-full overflow-hidden rounded-2xl border-2 border-dashed border-primary/50 bg-black/90 shadow-inner select-none cursor-grab active:cursor-grabbing"
          >
            {imgError ? (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center text-xs text-muted-foreground">
                <p>Không thể tải ảnh để căn chỉnh.</p>
                <p className="mt-1 text-[10px]">Hãy chắc chắn đường dẫn ảnh chính xác.</p>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={displayUrl || normalizeImageUrl(imageUrl)}
                alt="Ảnh căn chỉnh"
                draggable={false}
                onError={handleImgError}
                onLoad={(e) => {
                  const target = e.currentTarget
                  setImageSize({ width: target.naturalWidth, height: target.naturalHeight })
                  setImgError(false)
                }}
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
                  transformOrigin: "center center",
                  objectFit: fitMode,
                  transition: isDragging ? "none" : "transform 0.15s ease-out",
                }}
                className="pointer-events-none size-full"
              />
            )}

            {/* Grid overlay guide */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3 opacity-25">
              <div className="border-b border-r border-white/60" />
              <div className="border-b border-r border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-b border-r border-white/60" />
              <div className="border-b border-r border-white/60" />
              <div className="border-b border-white/60" />
              <div className="border-r border-white/60" />
              <div className="border-r border-white/60" />
              <div />
            </div>

            {/* Hint overlay */}
            <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-[10px] font-medium text-white/90 backdrop-blur-sm">
              <Move className="mr-1 inline size-3" />
              Kéo để di chuyển
            </span>
          </div>

          {/* Controls Bar */}
          <div className="mt-4 w-full space-y-3">
            {/* Tỉ lệ khung hình */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Tỉ lệ khung:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: "1:1", title: "Vuông (1:1)", val: 1 },
                  { label: "4:3", title: "Ngang (4:3)", val: 4 / 3 },
                  { label: "3:4", title: "Dọc (3:4)", val: 3 / 4 },
                  { label: "16:9", title: "Rộng (16:9)", val: 16 / 9 },
                ].map((item) => (
                  <Button
                    key={item.label}
                    type="button"
                    variant={Math.abs(aspect - item.val) < 0.05 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspect(item.val)}
                    className="h-6 px-2 text-[11px]"
                    title={item.title}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-3">
              <ZoomOut className="size-4 text-muted-foreground" />
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-lg bg-muted accent-primary"
              />
              <ZoomIn className="size-4 text-muted-foreground" />
              <span className="w-12 text-right text-xs font-mono font-medium text-foreground">
                {Math.round(scale * 100)}%
              </span>
            </div>

            {/* Alignment and Tools Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-border">
              {/* Quick Direction Shifts */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-semibold text-muted-foreground mr-1">Căn:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alignTo("top")}
                  className="h-7 px-2 text-xs"
                  title="Căn lên phần đỉnh (mặt người)"
                >
                  Trên
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alignTo("center")}
                  className="h-7 px-2 text-xs font-semibold"
                  title="Căn giữa chính tâm"
                >
                  Giữa
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alignTo("bottom")}
                  className="h-7 px-2 text-xs"
                  title="Căn phần đáy"
                >
                  Dưới
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alignTo("left")}
                  className="h-7 px-2 text-xs"
                  title="Căn sang trái"
                >
                  Trái
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => alignTo("right")}
                  className="h-7 px-2 text-xs"
                  title="Căn sang phải"
                >
                  Phải
                </Button>
              </div>

              {/* Fit mode & Rotate */}
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant={fitMode === "cover" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFitMode(fitMode === "cover" ? "contain" : "cover")}
                  className="h-7 gap-1 px-2 text-xs"
                  title={fitMode === "cover" ? "Chuyển sang xem trọn vẹn (Contain)" : "Chuyển sang lấp đầy khung (Cover)"}
                >
                  {fitMode === "cover" ? (
                    <>
                      <Maximize2 className="size-3" />
                      Tràn viền
                    </>
                  ) : (
                    <>
                      <Minimize2 className="size-3" />
                      Vừa vặn
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="h-7 px-2 text-xs"
                  title="Xoay 90 độ"
                >
                  <RotateCw className="size-3.5" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={resetAll}
                  className="h-7 px-2 text-xs"
                  title="Đặt lại ban đầu"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isProcessing}>
            Hủy
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={isProcessing || imgError}
            className="gap-1.5 bg-primary text-primary-foreground"
          >
            {isProcessing ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Đang xử lý ảnh...
              </>
            ) : (
              <>
                <Check className="size-3.5" />
                Áp dụng căn chỉnh
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
