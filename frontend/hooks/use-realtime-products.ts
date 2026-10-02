"use client"

import { useEffect, useCallback, useRef } from "react"

/**
 * Hook lắng nghe sự kiện realtime "products_changed" từ cart-provider.
 * Khi admin tạo / sửa / xóa sản phẩm, callback sẽ được gọi để trang
 * shop tự động tải lại danh sách sản phẩm mới nhất.
 *
 * @param callback - Hàm sẽ được gọi khi có thay đổi sản phẩm realtime.
 */
export function useRealtimeProducts(callback: () => void) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const handler = useCallback(() => {
    callbackRef.current()
  }, [])

  useEffect(() => {
    window.addEventListener("products_changed", handler)
    return () => window.removeEventListener("products_changed", handler)
  }, [handler])
}
