"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { Info, X } from "lucide-react"
import { getProductDetails, type Product } from "@/lib/ethnic-data"

export function ProductCard({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false)
  const details = getProductDetails(product)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isOpen])

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Xem chi tiết ${product.name}`}
      >
        <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image || "/placeholder.svg"}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2 py-0.5 text-[10px] font-semibold text-foreground">
          {product.category}
        </span>
        </div>
        <div className="flex flex-1 items-center justify-between gap-3 p-4">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
            {product.name}
          </h3>
          <Info className="size-4 shrink-0 text-primary" />
        </div>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`product-title-${product.id}`}
            className="relative grid max-h-[90vh] w-full max-w-2xl gap-0 overflow-auto rounded-2xl border border-border bg-card shadow-xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-background/90 text-foreground shadow-sm hover:bg-muted"
              aria-label="Đóng thông tin sản phẩm"
            >
              <X className="size-5" />
            </button>
            <div className="relative min-h-64 self-stretch md:min-h-0">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                Giới thiệu sản phẩm truyền thống
              </span>
              <span className="mt-2 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {product.category}
              </span>
              <h2 id={`product-title-${product.id}`} className="mt-2 font-serif text-2xl font-bold text-foreground">
                {product.name}
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {product.description ||
                  `${product.name} là sản phẩm truyền thống thuộc nhóm ${product.category.toLowerCase()}, gắn với kỹ thuật thủ công và đời sống văn hóa của cộng đồng.`}
              </p>
              {details && (
                <dl className="mt-5 space-y-3 border-t border-border pt-5 text-sm">
                  <div>
                    <dt className="font-semibold text-foreground">Nguồn gốc</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{details.origin}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Chất liệu và kỹ thuật</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{details.craft}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-foreground">Giá trị văn hóa</dt>
                    <dd className="mt-1 leading-relaxed text-muted-foreground">{details.culturalValue}</dd>
                  </div>
                </dl>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
