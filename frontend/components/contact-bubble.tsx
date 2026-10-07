"use client"

import { useState, useEffect } from "react"
import { Phone, MessageCircle, X, ExternalLink, Headphones } from "lucide-react"

export function ContactBubble() {
  const [isOpen, setIsOpen] = useState(false)

  // Lắng nghe sự kiện mở bong bóng từ bất kỳ đâu (ví dụ mục Vùng cư trú)
  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener("open-contact-bubble", handleOpen)
    return () => window.removeEventListener("open-contact-bubble", handleOpen)
  }, [])

  const phoneNumber = "0369170660"
  const formattedPhone = "0369 170 660"
  const facebookUrl = "https://www.facebook.com/profile.php?id=61594572455684"
  const tiktokUrl = "https://www.tiktok.com/@honydatviet"
  const zaloUrl = `https://zalo.me/${phoneNumber}`

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Cửa sổ bong bóng thông tin liên hệ */}
      {isOpen && (
        <div className="mb-3 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header (bỏ nút X ở đây để chỉ giữ duy nhất 1 nút X ở bong bóng tròn bên dưới) */}
          <div className="relative bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-white/20 text-white">
                <Headphones className="size-4 text-white" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-white leading-tight">
                  Tư vấn & Hỗ trợ
                </h3>
                <p className="text-[11px] text-emerald-100">Hồn Y Đất Việt luôn sẵn sàng đồng hành cùng bạn</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-2.5 p-4">
            {/* 1. Số điện thoại (chỉ để mỗi số, bỏ nút copy và nút gọi ngay theo yêu cầu) */}
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-emerald-500/50 hover:bg-emerald-500/5">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Phone className="size-4" />
              </span>
              <div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Số điện thoại
                </span>
                <p className="font-mono text-base font-bold text-foreground">
                  {phoneNumber}
                </p>
              </div>
            </div>

            {/* 2. Facebook */}
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-blue-500/50 hover:bg-blue-500/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-blue-500/10 text-blue-600">
                  <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Facebook
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">
                    Hồn Y Đất Việt
                  </p>
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </a>

            {/* 3. TikTok */}
            <a
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-pink-500/50 hover:bg-pink-500/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-black/10 text-foreground">
                  <svg className="size-4.5 fill-current" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.5 6.3 6.3 0 0 0 1.86-4.49V8.58a8.27 8.27 0 0 0 4.84 1.55v-3.44h-.93z" />
                  </svg>
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    TikTok
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">
                    @honydatviet
                  </p>
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </a>

            {/* 4. Zalo */}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/5"
            >
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-cyan-500/10 text-cyan-600 font-bold text-xs">
                  Zalo
                </span>
                <div className="min-w-0">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    Chat Zalo
                  </span>
                  <p className="truncate text-sm font-semibold text-foreground">
                    {phoneNumber}
                  </p>
                </div>
              </div>
              <ExternalLink className="size-4 text-muted-foreground" />
            </a>
          </div>

          <div className="border-t border-border bg-muted/40 px-4 py-2 text-center text-[10px] text-muted-foreground">
            Hỗ trợ từ 8:00 - 22:00 tất cả các ngày
          </div>
        </div>
      )}

      {/* Nút bấm hình tròn (màu xanh ngọc Emerald nổi bật, viền trắng chống trùng màu với footer đỏ) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group relative grid size-14 place-items-center rounded-full bg-emerald-600 text-white shadow-2xl shadow-emerald-950/40 ring-2 ring-white/90 transition-all duration-300 hover:scale-110 hover:bg-emerald-500 hover:shadow-emerald-600/50 focus:outline-none focus:ring-4 focus:ring-emerald-400/40"
        aria-label="Liên hệ tư vấn"
      >
        {/* Vòng hiệu ứng gợn sóng khi đóng */}
        {!isOpen && (
          <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-emerald-500/50 opacity-75" />
        )}

        <div className="relative grid size-6 place-items-center">
          {isOpen ? (
            <X className="size-6 transition-transform duration-200 group-hover:rotate-90" />
          ) : (
            <MessageCircle className="size-6 transition-transform duration-200 group-hover:scale-110" />
          )}
        </div>

        {/* Chấm trạng thái online */}
        <span className="absolute -top-0.5 -right-0.5 flex size-3.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex size-3.5 rounded-full border-2 border-background bg-emerald-500" />
        </span>
      </button>
    </div>
  )
}
