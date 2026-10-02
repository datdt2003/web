"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ShoppingCart,
  Check,
  Loader2,
  AlertCircle,
  Store,
  Package,
  X,
  Copy,
  CheckCircle2,
  QrCode,
  ShieldCheck,
  Sparkles,
  Zap,
  RefreshCw,
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { formatVND, type Product } from "@/lib/ethnic-data"
import { ShopProductCard } from "@/components/shop-product-card"
import { cn } from "@/lib/utils"
import { SEPAY_CONFIG, generateSepayQrUrl } from "@/lib/sepay"

type View = "products" | "cart"

export default function CartPage() {
  const { items, total, count, setQty, remove, clear } = useCart()
  const { user } = useAuth()
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<View>("products")
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  // Thông tin giao hàng
  const [customerName, setCustomerName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")

  // SePay QR modal state
  const [showQR, setShowQR] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<{
    id: string
    paymentCode: string
    total: number
  } | null>(null)
  const [paymentTimeLeft, setPaymentTimeLeft] = useState(600) // 10 phút = 600 giây
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isCheckingPayment, setIsCheckingPayment] = useState(false)
  const [checkMessage, setCheckMessage] = useState<string | null>(null)
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false)
  const [paymentStatusStep, setPaymentStatusStep] = useState<"waiting" | "processing" | "success">("waiting")
  const [paymentSuccessAnim, setPaymentSuccessAnim] = useState(false)

  const paymentTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const shipping = total > 0 ? 30000 : 0
  const finalTotal = total + shipping

  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name)
      if (user.email) setEmail(user.email)
    }
  }, [user])

  // Lấy danh sách sản phẩm có sẵn từ cơ sở dữ liệu
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("/api/products")
        if (res.ok) {
          const data = await res.json()
          const forSaleProducts = data.data.filter((p: Product) => p.forSale && p.inStock)
          setAvailableProducts(forSaleProducts)
        }
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err)
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  // Dọn dẹp timer khi component unmount
  useEffect(() => {
    return () => {
      if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    }
  }, [])

  // Hàm hoàn thành đơn hàng khi thanh toán thành công (hiển thị chuyển đổi: đang thanh toán -> thanh toán thành công)
  const handleOrderCompleted = (orderId: string) => {
    if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    
    // Bước 1: Hiển thị trạng thái đang thanh toán đơn hàng
    setPaymentStatusStep("processing")

    setTimeout(() => {
      // Bước 2: Hiển thị thanh toán thành công
      setPaymentStatusStep("success")
      setPaymentSuccessAnim(true)

      setTimeout(() => {
        // Bước 3: Đóng modal và chuyển sang màn hình đơn hàng đã thanh toán
        setShowQR(false)
        setCreatedOrderId(orderId)
        clear()
        setPaymentStatusStep("waiting")
        setPaymentSuccessAnim(false)
      }, 1500)
    }, 1200)
  }

  // Hàm giả lập thanh toán thành công dành cho môi trường Localhost (chưa deploy)
  const handleSimulatePayment = async () => {
    if (!currentOrder?.id) return
    setIsSimulatingPayment(true)
    try {
      const res = await fetch("/api/sepay/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrder.id,
          paymentCode: currentOrder.paymentCode,
        }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        handleOrderCompleted(currentOrder.id)
      } else {
        alert(data.message || "Có lỗi khi giả lập thanh toán.")
      }
    } catch (err: any) {
      console.error("Lỗi giả lập thanh toán:", err)
      alert("Không thể giả lập thanh toán: " + (err.message || "Lỗi mạng"))
    } finally {
      setIsSimulatingPayment(false)
    }
  }

  // Lắng nghe SSE và Polling kiểm tra trạng thái đơn hàng khi mở modal QR
  useEffect(() => {
    if (!showQR || !currentOrder?.id) return

    const orderId = currentOrder.id

    // 1. Kiểm tra định kỳ bằng Polling API mỗi 2 giây (không cache)
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}?t=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        })
        if (res.ok) {
          const result = await res.json()
          if (
            result?.data?.status === "completed" ||
            result?.data?.paymentStatus === "paid"
          ) {
            handleOrderCompleted(orderId)
          }
        }
      } catch (e) {
        console.error("Error polling order status:", e)
      }
    }, 2000)

    // 2. Lắng nghe Realtime qua Server-Sent Events
    let eventSource: EventSource | null = null
    try {
      eventSource = new EventSource("/api/realtime")
      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data)
          if (
            payload.type === "order.updated" &&
            payload.data?.orderId === orderId &&
            (payload.data?.status === "completed" || payload.data?.paymentStatus === "paid")
          ) {
            handleOrderCompleted(orderId)
          }
        } catch {
          // ignore parse error
        }
      }
    } catch (e) {
      console.error("SSE connection error:", e)
    }

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (eventSource) eventSource.close()
    }
  }, [showQR, currentOrder?.id])

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!customerName.trim() || !email.trim() || !phone.trim() || !city.trim() || !address.trim()) {
      setError("Vui lòng điền đầy đủ tất cả thông tin: Họ tên, Email, Số điện thoại, Thành phố và Địa chỉ nhận hàng.")
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          city,
          address,
          items,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Không thể tạo đơn hàng.")
      }

      const newOrderId = data.orderId || data.data?._id
      const paymentCode = data.paymentCode || data.data?.paymentCode || `SV${newOrderId.slice(-8).toUpperCase()}`
      const orderTotal = data.total || data.data?.total || finalTotal

      setCurrentOrder({
        id: newOrderId,
        paymentCode,
        total: orderTotal,
      })

      // Hiển thị modal SePay QR và đếm ngược 10 phút
      setShowQR(true)
      setPaymentTimeLeft(600)

      if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
      paymentTimerRef.current = setInterval(() => {
        setPaymentTimeLeft((prev) => {
          if (prev <= 1) {
            if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
            setShowQR(false)
            setError("Thời gian thanh toán đã hết hạn. Vui lòng thử lại.")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo đơn hàng.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Kiểm tra thủ công ngay lập tức khi người dùng tự chuyển khoản và bấm "Tôi đã chuyển khoản"
  const handleManualCheckPayment = async () => {
    if (!currentOrder?.id) return
    setIsCheckingPayment(true)
    setCheckMessage(null)
    try {
      const res = await fetch(`/api/orders/${currentOrder.id}?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (res.ok) {
        const result = await res.json()
        if (
          result?.data?.status === "completed" ||
          result?.data?.paymentStatus === "paid"
        ) {
          handleOrderCompleted(currentOrder.id)
          return
        }
      }
      // Nếu chưa nhận được tiền trong danh sách giao dịch SePay:
      setCheckMessage(
        `Chưa ghi nhận giao dịch cho mã ${currentOrder.paymentCode}. Nếu bạn vừa chuyển khoản thành công từ App ngân hàng, vui lòng chờ 10 - 20 giây để hệ thống ngân hàng đồng bộ về SePay rồi bấm lại (hệ thống vẫn đang tự động dò tìm liên tục).`
      )
    } catch (err) {
      console.error(err)
      setCheckMessage("Không thể kết nối đến máy chủ để kiểm tra. Vui lòng thử lại sau giây lát.")
    } finally {
      setIsCheckingPayment(false)
    }
  }

  const handlePaymentCancel = () => {
    if (paymentTimerRef.current) clearInterval(paymentTimerRef.current)
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
    setShowQR(false)
    setCurrentOrder(null)
    setPaymentStatusStep("waiting")
    setCheckMessage(null)
  }

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }


  if (createdOrderId) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center animate-in zoom-in-95">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
          <CheckCircle2 className="size-10" />
        </span>
        <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
          Thanh toán & Đặt hàng thành công!
        </h1>
        <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-sm text-emerald-700 font-semibold">
          ✓ Đơn hàng đã được xác nhận thanh toán thành công qua chuyển khoản!
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Mã đơn hàng: <span className="font-mono font-bold text-primary">{createdOrderId}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          Đơn hàng đã được lưu vào hệ thống cơ sở dữ liệu. Cảm ơn bạn đã ủng hộ sản phẩm thủ công truyền thống của các dân tộc Việt Nam.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/tai-khoan" className={cn(buttonVariants({ variant: "outline" }))}>
            Xem đơn hàng của tôi
          </Link>
          <Link href="/dan-toc" className={cn(buttonVariants(), "bg-primary text-primary-foreground")}>
            Tiếp tục khám phá
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar bên trái */}
        <aside className="space-y-2">
          <button
            type="button"
            onClick={() => setActiveView("products")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
              activeView === "products"
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground/80 hover:bg-muted"
            )}
          >
            <Store className="size-4" />
            Sản phẩm có sẵn
          </button>

          {user && (
            <button
              type="button"
              onClick={() => setActiveView("cart")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                activeView === "cart"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-foreground/80 hover:bg-muted"
              )}
            >
              <Package className="size-4" />
              Giỏ hàng của bạn
              {count > 0 && (
                <span className="ml-auto flex size-5 items-center justify-center rounded-full bg-primary/20 text-[10px] font-bold text-primary">
                  {count}
                </span>
              )}
            </button>
          )}
        </aside>

        {/* Nội dung bên phải */}
        <div>
          {activeView === "products" || !user ? (
            <>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Sản phẩm có sẵn</h1>
              <p className="mt-2 text-muted-foreground">
                Khám phá và mua các sản phẩm thủ công truyền thống từ 54 dân tộc Việt Nam
              </p>

              {loadingProducts ? (
                <div className="mt-6 flex items-center justify-center py-12">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                  <span className="ml-3 text-muted-foreground">Đang tải sản phẩm...</span>
                </div>
              ) : availableProducts.length > 0 ? (
                <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-3">
                  {availableProducts.map((product) => (
                    <ShopProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <ShoppingBag className="mx-auto size-12 text-muted-foreground/60" />
                  <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                    Chưa có sản phẩm nào để bán
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Quản trị viên chưa đăng sản phẩm bán hàng.
                  </p>
                  <Link href="/dan-toc" className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                    Khám phá thông tin dân tộc
                  </Link>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">Giỏ hàng của bạn</h1>
              <p className="mt-1 text-muted-foreground">{count} sản phẩm trong giỏ</p>


              {count === 0 ? (
                <div className="mt-8 text-center py-24">
                  <span className="mx-auto grid size-16 place-items-center rounded-full bg-muted text-muted-foreground">
                    <ShoppingBag className="size-8" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-bold text-foreground">Giỏ hàng trống</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Chưa có sản phẩm nào trong giỏ hàng của bạn
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveView("products")}
                    className={cn(buttonVariants(), "mt-4 bg-primary text-primary-foreground")}
                  >
                    Đến chọn sản phẩm
                  </button>
                </div>
              ) : (
                <div className="mt-8 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                  {/* Items */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 rounded-xl border border-border bg-card p-4 shadow-sm"
                      >
                        <div className="relative size-24 shrink-0 overflow-hidden rounded-lg">
                          <Image src={item.image || "/placeholder.svg"} alt={item.name} fill sizes="96px" className="object-cover" />
                        </div>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[11px] font-semibold text-muted-foreground">{item.category}</span>
                              <h3 className="text-sm font-semibold leading-snug text-foreground">{item.name}</h3>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              className="text-muted-foreground transition-colors hover:text-primary"
                              aria-label="Xóa"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                          <div className="mt-auto flex items-center justify-between pt-2">
                            <div className="flex items-center rounded-lg border border-border">
                              <button
                                type="button"
                                onClick={() => setQty(item.id, item.qty - 1)}
                                className="grid size-8 place-items-center text-foreground hover:bg-muted"
                                aria-label="Giảm"
                              >
                                <Minus className="size-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => setQty(item.id, item.qty + 1)}
                                className="grid size-8 place-items-center text-foreground hover:bg-muted"
                                aria-label="Tăng"
                              >
                                <Plus className="size-3.5" />
                              </button>
                            </div>
                            <span className="font-serif font-bold text-primary">{formatVND(item.price * item.qty)}</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={clear}
                      className="text-sm font-medium text-muted-foreground hover:text-primary"
                    >
                      Xóa toàn bộ giỏ hàng
                    </button>
                  </div>

                  {/* Summary & Checkout Form */}
                  <aside className="lg:sticky lg:top-24 lg:h-fit">
                    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                      <div className="flex items-center justify-between">
                        <h2 className="font-serif text-xl font-bold text-foreground">Thông tin thanh toán</h2>
                      </div>

                      {error && (
                        <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                          <AlertCircle className="size-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <form onSubmit={handleCheckout} className="mt-4 space-y-3">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Họ tên người nhận *</label>
                          <Input
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Email *</label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Số điện thoại *</label>
                          <Input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Thành phố *</label>
                          <Input
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-foreground">Địa chỉ nhận hàng *</label>
                          <Input
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            required
                          />
                        </div>

                        <div className="my-4 h-px bg-border" />

                        <dl className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Tạm tính</dt>
                            <dd className="font-medium text-foreground">{formatVND(total)}</dd>
                          </div>
                          <div className="flex justify-between">
                            <dt className="text-muted-foreground">Phí vận chuyển</dt>
                            <dd className="font-medium text-foreground">{formatVND(shipping)}</dd>
                          </div>
                          <div className="my-2 h-px bg-border" />
                          <div className="flex justify-between text-base">
                            <dt className="font-semibold text-foreground">Tổng cộng</dt>
                            <dd className="font-serif text-xl font-bold text-primary">{formatVND(total + shipping)}</dd>
                          </div>
                        </dl>

                        {!user && (
                          <p className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                            Bạn chưa đăng nhập. Bạn có thể{" "}
                            <Link href="/dang-nhap" className="font-semibold text-primary hover:underline">
                              đăng nhập
                            </Link>{" "}
                            để quản lý đơn hàng sau này.
                          </p>
                        )}

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="mt-4 w-full bg-primary text-primary-foreground"
                          size="lg"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 size-4 animate-spin" />
                              Đang xử lý đơn hàng...
                            </>
                          ) : (
                            <>
                              <ShoppingCart className="size-4" />
                              Thanh toán
                            </>
                          )}
                        </Button>
                      </form>
                    </div>
                  </aside>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* SePay QR Code Payment Modal */}
      {showQR && currentOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative max-w-lg w-full max-h-[92vh] overflow-y-auto rounded-3xl border border-border bg-card p-6 md:p-8 shadow-2xl transition-all">
            <button
              type="button"
              onClick={handlePaymentCancel}
              className="absolute right-4 top-4 grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
              aria-label="Đóng"
            >
              <X className="size-4" />
            </button>

            {paymentStatusStep === "processing" ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95">
                <div className="relative mb-5 grid size-20 place-items-center rounded-full bg-primary/10 text-primary">
                  <Loader2 className="size-10 animate-spin text-primary" />
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-600 mb-2">
                  <CheckCircle2 className="size-3.5" />
                  Đã ghi nhận giao dịch chuyển khoản!
                </div>
                <h3 className="font-serif text-2xl font-bold text-foreground">
                  Đang thanh toán đơn hàng...
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Mã đơn hàng: <span className="font-mono font-bold text-primary">{currentOrder.paymentCode}</span>
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Hệ thống đang xử lý và kích hoạt trạng thái đơn hàng trong giây lát...
                </p>
              </div>
            ) : paymentStatusStep === "success" || paymentSuccessAnim ? (
              <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95">
                <div className="grid size-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 shadow-inner">
                  <CheckCircle2 className="size-12 animate-bounce" />
                </div>
                <h3 className="mt-5 font-serif text-2xl font-bold text-foreground">
                  Thanh toán thành công!
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Đơn hàng của bạn đã hoàn thành. Hệ thống đang chuyển hướng...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" />
                  Thanh toán tự động qua SePay
                </div>

                <h2 className="mt-3 font-serif text-2xl font-bold text-foreground">
                  Quét mã QR Chuyển khoản
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Sử dụng ứng dụng ngân hàng bất kỳ để quét mã QR bên dưới
                </p>

                {/* SePay QR Code Image */}
                <div className="mt-5 flex justify-center">
                  <div className="relative rounded-2xl border-2 border-primary/20 bg-white p-3.5 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={generateSepayQrUrl({
                        amount: currentOrder.total,
                        description: currentOrder.paymentCode,
                      })}
                      alt={`Mã QR thanh toán đơn hàng ${currentOrder.id}`}
                      className="size-56 md:size-64 object-contain rounded-lg"
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Thời gian đếm ngược & trạng thái chờ */}
                <div className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 px-4 py-2 text-amber-700 dark:text-amber-400">
                  <Loader2 className="size-4 animate-spin text-amber-600" />
                  <span className="text-xs font-medium">Hệ thống đang tự động xác nhận:</span>
                  <span className="font-mono text-sm font-bold">{formatTime(paymentTimeLeft)}</span>
                </div>

                {/* Chi tiết chuyển khoản & sao chép tiện lợi */}
                <div className="mt-5 rounded-2xl border border-border bg-muted/40 p-4 text-left text-xs space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Ngân hàng</span>
                    <span className="font-bold text-foreground">{SEPAY_CONFIG.BANK}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Chủ tài khoản</span>
                    <span className="font-bold text-foreground">{SEPAY_CONFIG.NAME}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Số tài khoản</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-foreground">{SEPAY_CONFIG.ACC}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(SEPAY_CONFIG.ACC, "acc")}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Sao chép số tài khoản"
                      >
                        {copiedField === "acc" ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Số tiền</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary text-sm">
                        {formatVND(currentOrder.total)}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrder.total.toString(), "amount")}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Sao chép số tiền"
                      >
                        {copiedField === "amount" ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-muted-foreground">Nội dung chuyển khoản</span>
                      <p className="text-[10px] text-red-500 font-medium">* Giữ nguyên nội dung này</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        {currentOrder.paymentCode}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(currentOrder.paymentCode, "code")}
                        className="rounded p-1 hover:bg-muted text-muted-foreground hover:text-foreground"
                        title="Sao chép mã chuyển khoản"
                      >
                        {copiedField === "code" ? (
                          <Check className="size-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Trạng thái tự động kiểm tra giao dịch */}
                <div className="mt-5 space-y-2.5">
                  <div className="flex items-center justify-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs text-primary font-medium">
                    <Loader2 className="size-4 animate-spin text-primary shrink-0" />
                    <span>Hệ thống đang tự động kiểm tra giao dịch chuyển khoản...</span>
                  </div>

                  <p className="text-[11px] text-center text-muted-foreground leading-normal">
                    💡 Sau khi bạn quét mã chuyển khoản thành công trên App ngân hàng, hệ thống sẽ tự động phát hiện trong vòng 5 – 20 giây và chuyển sang trang hoàn tất đơn hàng.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
