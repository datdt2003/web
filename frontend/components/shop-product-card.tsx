"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { formatVND, type Product } from "@/lib/ethnic-data"

export function ShopProductCard({ product }: { product: Product }) {
  const { add } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const handleAddToCart = () => {
    if (!user) {
      alert("Vui lòng đăng nhập tài khoản để thêm sản phẩm vào giỏ hàng.")
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "/"
      router.push(`/dang-nhap?redirect=${encodeURIComponent(currentPath)}`)
      return
    }
    add(product)
  }


  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground">
          {product.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
          {product.name}
        </h3>
        <p className="mt-2 font-serif text-lg font-bold text-primary">
          {formatVND(product.price)}
        </p>
        <button
          type="button"
          onClick={handleAddToCart}
          className="mt-auto flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <ShoppingCart className="size-4" />
          Thêm vào giỏ
        </button>
      </div>
    </div>
  )
}
