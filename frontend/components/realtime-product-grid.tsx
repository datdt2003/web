"use client"

import { useEffect, useState, useCallback } from "react"
import { ProductCard } from "@/components/product-card"
import { useRealtimeProducts } from "@/hooks/use-realtime-products"
import type { Product } from "@/lib/ethnic-data"

interface RealtimeProductGridProps {
  /** Sản phẩm khởi tạo từ server (SSR) */
  initialProducts: Product[]
  /** Slug dân tộc để fetch sản phẩm theo nhóm */
  ethnicSlug: string
}

/**
 * Grid sản phẩm realtime — tự động tải lại khi admin tạo / sửa / xóa sản phẩm.
 * Nhận dữ liệu khởi tạo từ server, sau đó lắng nghe SSE qua hook useRealtimeProducts.
 */
export function RealtimeProductGrid({ initialProducts, ethnicSlug }: RealtimeProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)

  // Đồng bộ lại nếu server render lại với dữ liệu mới
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  const refreshProducts = useCallback(async () => {
    try {
      const res = await fetch(`/api/products?ethnicSlug=${encodeURIComponent(ethnicSlug)}`)
      if (res.ok) {
        const data = await res.json()
        if (data.data && data.data.length > 0) {
          setProducts(data.data)
        }
      }
    } catch (err) {
      console.error("Lỗi tải lại sản phẩm realtime:", err)
    }
  }, [ethnicSlug])

  // Lắng nghe sự kiện realtime từ cart-provider
  useRealtimeProducts(refreshProducts)

  if (products.length === 0) return null

  return (
    <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  )
}
