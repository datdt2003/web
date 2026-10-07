"use client"

import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, ShoppingBag, X } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { formatVND } from "@/lib/ethnic-data"

export function CartNotification() {
  const { lastAddedItem, closeNotification, count } = useCart()

  if (!lastAddedItem) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-[9999] w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-emerald-500/30 bg-card p-4 shadow-2xl ring-1 ring-black/10 animate-in fade-in slide-in-from-top-4 duration-300 md:right-8"
    >
      <div className="flex items-start justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="size-5 shrink-0" />
          <span className="text-xs font-semibold uppercase tracking-wider">
            Đã thêm vào giỏ hàng thành công!
          </span>
        </div>
        <button
          type="button"
          onClick={closeNotification}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Đóng thông báo"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
          <Image
            src={lastAddedItem.image || "/placeholder.svg"}
            alt={lastAddedItem.name}
            fill
            sizes="56px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="line-clamp-1 text-sm font-semibold text-foreground">
            {lastAddedItem.name}
          </h4>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Số lượng: <span className="font-semibold text-foreground">+{lastAddedItem.qty}</span>
          </p>
          <p className="mt-0.5 font-serif text-sm font-bold text-primary">
            {formatVND(lastAddedItem.price)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={closeNotification}
          className="flex-1 rounded-xl border border-border bg-background py-2 text-center text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          Tiếp tục xem
        </button>
        <Link
          href="/gio-hang"
          onClick={closeNotification}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-primary py-2 text-center text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <ShoppingBag className="size-3.5" />
          Xem giỏ hàng ({count})
        </Link>
      </div>
    </div>
  )
}

