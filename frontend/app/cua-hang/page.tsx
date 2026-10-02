"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Loader2, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ShopProductCard } from "@/components/shop-product-card"
import { type Product } from "@/lib/ethnic-data"

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const PRODUCTS_PER_PAGE = 9

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data = await res.json()
          // Chỉ hiển thị sản phẩm có forSale: true và inStock: true
          const forSaleProducts = data.data.filter((p: Product) => p.forSale && p.inStock)
          setProducts(forSaleProducts)
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE) || 1
  const safePage = Math.min(page, totalPages)
  const paginatedProducts = products.slice((safePage - 1) * PRODUCTS_PER_PAGE, safePage * PRODUCTS_PER_PAGE)

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Cửa hàng Hồn Y Đất Việt</h1>
        <p className="mt-2 text-muted-foreground">
          Khám phá và mua các sản phẩm thủ công truyền thống từ 54 dân tộc Việt Nam
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Đang tải sản phẩm...</span>
        </div>
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-5 md:grid-cols-4">
            {paginatedProducts.map((product) => (
              <ShopProductCard key={product.id} product={product} />
            ))}
          </div>

          {products.length > PRODUCTS_PER_PAGE && (
            <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
              <span className="text-muted-foreground">
                Hiển thị {(safePage - 1) * PRODUCTS_PER_PAGE + 1} -{" "}
                {Math.min(safePage * PRODUCTS_PER_PAGE, products.length)} / {products.length} sản phẩm
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={safePage <= 1}
                  className="h-8 gap-1 px-2.5"
                >
                  <ChevronLeft className="size-3.5" />
                  Trước
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      className={`size-8 rounded-md text-xs font-semibold transition-colors ${
                        p === safePage
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safePage >= totalPages}
                  className="h-8 gap-1 px-2.5"
                >
                  Sau
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="size-16 text-muted-foreground/60" />
          <h2 className="mt-4 font-serif text-2xl font-bold text-foreground">Chưa có sản phẩm nào</h2>
          <p className="mt-2 text-muted-foreground">
            Quản trị viên chưa đăng sản phẩm bán hàng.
          </p>
        </div>
      )}
    </div>
  )
}
