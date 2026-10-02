"use client"

import { createContext, useContext, useEffect, useMemo, useState, useRef, type ReactNode } from "react"
import type { Product } from "@/lib/ethnic-data"
import { useAuth } from "@/components/providers/auth-provider"

export interface CartItem extends Product {
  qty: number
}

interface CartContextValue {
  items: CartItem[]
  count: number
  total: number
  add: (product: Product, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  lastAddedItem: CartItem | null
  closeNotification: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null)
  const isInternalUpdate = useRef(false)

  // Khóa lưu trữ giỏ hàng theo tài khoản: nếu có user thì dùng key riêng theo email/id
  const getStorageKey = (currentUser: typeof user) => {
    if (!currentUser) return null
    return `sac_viet_cart_${currentUser.email || currentUser.id || "guest"}`
  }

  // Khi trạng thái đăng nhập hoặc tài khoản thay đổi:
  useEffect(() => {
    if (authLoading) return

    if (!user) {
      // Khi không có user (chưa đăng nhập hoặc vừa đăng xuất) -> giỏ hàng luôn trống 100%
      setItems([])
      setIsLoaded(true)
      return
    }

    // Khi đã đăng nhập -> tải giỏ hàng của tài khoản đó
    const key = getStorageKey(user)
    if (key) {
      try {
        const saved = localStorage.getItem(key)
        setItems(saved ? JSON.parse(saved) : [])
      } catch (e) {
        console.error("Lỗi đọc giỏ hàng của user:", e)
        setItems([])
      }
    }
    setIsLoaded(true)
  }, [user, authLoading])

  // Lưu vào localStorage theo tài khoản user hiện tại
  useEffect(() => {
    if (!isLoaded || authLoading) return

    if (!user) {
      // Chưa đăng nhập thì không lưu vào tài khoản
      return
    }

    const key = getStorageKey(user)
    if (!key) return

    try {
      localStorage.setItem(key, JSON.stringify(items))
      isInternalUpdate.current = true
      window.dispatchEvent(new Event("cart_updated"))
      setTimeout(() => { isInternalUpdate.current = false }, 0)
    } catch (e) {
      console.error("Lỗi lưu giỏ hàng:", e)
    }
  }, [items, isLoaded, user, authLoading])


  // Lắng nghe sự kiện storage & realtime SSE để đồng bộ
  useEffect(() => {
    const handleStorageChange = () => {
      // Bỏ qua nếu đây là sự kiện do chính tab này phát ra
      if (isInternalUpdate.current || !user) return

      try {
        const key = getStorageKey(user)
        if (key) {
          const saved = localStorage.getItem(key)
          if (saved) setItems(JSON.parse(saved))
        }
      } catch {}
    }

    const handleCartCleared = () => {
      setItems([])
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("cart_updated", handleStorageChange)
    window.addEventListener("cart_cleared", handleCartCleared)


    // Lắng nghe realtime SSE cho tất cả sự kiện sản phẩm
    const eventSource = new EventSource("/api/realtime")
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === "product.deleted") {
          // Xóa sản phẩm bị gỡ khỏi giỏ hàng ngay lập tức
          setItems((prev) => prev.filter((i) => i.id !== data.data?.productId))
          // Thông báo cho các trang shop cập nhật danh sách sản phẩm
          window.dispatchEvent(new CustomEvent("products_changed", { detail: data }))
        }

        if (data.type === "product.created") {
          // Admin vừa tạo sản phẩm mới → thông báo để các trang shop tải lại danh sách
          window.dispatchEvent(new CustomEvent("products_changed", { detail: data }))
        }

        if (data.type === "product.updated") {
          // Cập nhật thông tin sản phẩm trong giỏ hàng nếu có thay đổi
          if (data.data?.productId) {
            // Tải lại thông tin sản phẩm mới nhất để đồng bộ giỏ hàng
            fetch(`/api/products/${data.data.productId}`)
              .then((res) => res.json())
              .then((result) => {
                if (result.success && result.data) {
                  const updated = result.data
                  setItems((prev) =>
                    prev.map((item) =>
                      item.id === updated.id
                        ? { ...item, name: updated.name, price: updated.price, image: updated.image }
                        : item
                    )
                  )
                }
              })
              .catch(() => {})
          }
          // Thông báo cho các trang shop cập nhật
          window.dispatchEvent(new CustomEvent("products_changed", { detail: data }))
        }
      } catch (err) {
        console.error("Cart realtime error:", err)
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("cart_updated", handleStorageChange)
      window.removeEventListener("cart_cleared", handleCartCleared)
      eventSource.close()
    }

  }, [])

  // Tự động tắt popup thông báo sau 4 giây
  useEffect(() => {
    if (lastAddedItem) {
      const timer = setTimeout(() => setLastAddedItem(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [lastAddedItem])

  const add = (product: Product, qty = 1) => {
    const itemToAdd: Product = { ...product, forSale: true }
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
      }
      return [...prev, { ...itemToAdd, qty }]
    })
    setLastAddedItem({ ...itemToAdd, qty })
  }

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id))

  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, qty) } : i)),
    )

  const clear = () => setItems([])
  const closeNotification = () => setLastAddedItem(null)

  const { count, total } = useMemo(() => {
    return items.reduce(
      (acc, i) => {
        acc.count += i.qty
        acc.total += i.qty * i.price
        return acc
      },
      { count: 0, total: 0 },
    )
  }, [items])

  return (
    <CartContext.Provider
      value={{
        items,
        count,
        total,
        add,
        remove,
        setQty,
        clear,
        lastAddedItem,
        closeNotification,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
