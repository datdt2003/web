"use client"

import { useRouter } from "next/navigation"
import { ShoppingCart, X } from "lucide-react"

interface LoginPromptModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

export function LoginPromptModal({
  isOpen,
  onClose,
  message = "Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng và theo dõi đơn hàng của bạn.",
}: LoginPromptModalProps) {
  const router = useRouter()

  if (!isOpen) return null

  const handleLogin = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : "/"
    router.push(`/dang-nhap?redirect=${encodeURIComponent(path)}`)
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3.5 top-3.5 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
          <ShoppingCart className="size-6" />
        </div>

        <h3 className="mt-4 font-serif text-lg font-bold text-foreground">
          Yêu cầu đăng nhập
        </h3>

        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={handleLogin}
            className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Đăng nhập ngay
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl border border-border bg-background py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Để sau
          </button>
        </div>
      </div>
    </div>
  )
}

