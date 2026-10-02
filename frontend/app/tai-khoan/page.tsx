"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"

type Order = {
  _id: string
  total: number
  status: string
  paymentStatus?: string
  paymentCode?: string
  items: { name: string; qty: number }[]
  createdAt: string
}

export default function AccountPage() {
  const { user, loading, updateProfile } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [section, setSection] = useState<"profile" | "orders">("profile")
  const [orderPage, setOrderPage] = useState(1)
  const ORDERS_PER_PAGE = 5
  const totalOrderPages = Math.ceil(orders.length / ORDERS_PER_PAGE) || 1
  const safeOrderPage = Math.min(orderPage, totalOrderPages)
  const paginatedOrders = orders.slice((safeOrderPage - 1) * ORDERS_PER_PAGE, safeOrderPage * ORDERS_PER_PAGE)

  const statusLabels: Record<string, { label: string; color: string }> = {
    pending: { label: "Chờ xử lý", color: "bg-amber-100 text-amber-800 border-amber-300" },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800 border-blue-300" },
    shipping: { label: "Đang giao hàng", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
    completed: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800 border-red-300" },
  }

  useEffect(() => {
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    fetch("/api/orders", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setOrders(data.data || []))
      .catch(() => setOrders([]))
  }, [user])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setMessage("")
    setError("")
    setSaving(true)
    const result = await updateProfile(name, email, currentPassword, newPassword)
    if (result.success) setMessage("Thông tin cá nhân đã được cập nhật.")
    else setError(result.error || "Không thể cập nhật thông tin.")
    if (result.success) {
      setCurrentPassword("")
      setNewPassword("")
    }
    setSaving(false)
  }

  if (loading) return <main className="mx-auto max-w-xl px-4 py-20 text-center">Đang tải thông tin...</main>
  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <p className="text-muted-foreground">Vui lòng đăng nhập để xem thông tin cá nhân.</p>
        <Link href="/dang-nhap" className="mt-4 inline-block font-semibold text-primary hover:underline">Đăng nhập</Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-16">
      <div className="mb-8">
        <div className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          {section === "profile" ? <UserRound className="size-6" /> : <ShoppingBag className="size-6" />}
        </div>
        <h1 className="mt-6 font-serif text-3xl font-bold text-foreground">
          {section === "profile" ? "Thông tin cá nhân" : "Đơn hàng của tôi"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {section === "profile" ? "Cập nhật thông tin tài khoản của bạn." : "Theo dõi các đơn hàng bạn đã đặt."}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-xl border border-border bg-card p-2">
          <button type="button" onClick={() => setSection("profile")} className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium ${section === "profile" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
            <UserRound className="size-4" /> Thông tin cá nhân
          </button>
          {user.role !== "admin" && (
            <button type="button" onClick={() => setSection("orders")} className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium ${section === "orders" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"}`}>
              <ShoppingBag className="size-4" /> Đơn hàng của tôi
            </button>
          )}
          <Link href="/" className="mt-4 flex items-center gap-2 border-t border-border px-3 pt-4 text-sm font-medium text-primary hover:underline"><ArrowLeft className="size-4" /> Về trang chủ</Link>
        </aside>

        <div>
          {message && <div className="mb-6 flex gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary"><CheckCircle2 className="size-4" />{message}</div>}
          {error && <div className="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          {section === "profile" ? (
            <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-border bg-card p-6">
              <div className="space-y-1.5"><label htmlFor="account-name" className="text-sm font-medium">Họ và tên</label><Input id="account-name" value={name} onChange={(event) => setName(event.target.value)} required disabled={saving} /></div>
              <div className="space-y-1.5"><label htmlFor="account-email" className="text-sm font-medium">Email</label><Input id="account-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={saving} /></div>
              <div className="border-t border-border pt-5">
                <h2 className="font-semibold text-foreground">Đổi mật khẩu</h2>
                <p className="mt-1 text-sm text-muted-foreground">Để trống nếu bạn không muốn đổi mật khẩu.</p>
                <div className="mt-4 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mật khẩu hiện tại</label>
                    <Input aria-label="Mật khẩu hiện tại" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} disabled={saving} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium">Mật khẩu mới (ít nhất 6 ký tự)</label>
                    <Input aria-label="Mật khẩu mới" type="password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} disabled={saving} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : null} Lưu thay đổi</Button>
            </form>
          ) : (
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <p className="text-sm text-muted-foreground">
                  Tổng số: <strong className="text-foreground">{orders.length}</strong> đơn hàng{" "}
                  <span className="text-xs text-muted-foreground font-normal">(đơn hàng mới nhất được xếp trên cùng)</span>
                </p>
                {orders.length > ORDERS_PER_PAGE && (
                  <span className="text-xs font-semibold text-primary">
                    Trang {safeOrderPage} / {totalOrderPages}
                  </span>
                )}
              </div>

              {orders.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
                  <ShoppingBag className="mx-auto size-12 text-muted-foreground/60" />
                  <h3 className="mt-3 font-serif text-lg font-semibold text-foreground">
                    Bạn chưa có đơn hàng nào
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Khám phá và sở hữu các sản phẩm thủ công truyền thống độc đáo ngay hôm nay.
                  </p>
                  <Link
                    href="/gio-hang"
                    className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {paginatedOrders.map((order, idx) => {
                      const isNewest = safeOrderPage === 1 && idx === 0
                      const st = statusLabels[order.status] || {
                        label: order.status,
                        color: "bg-muted text-muted-foreground border-border",
                      }
                      const isPaid = order.paymentStatus === "paid" || order.status === "completed"

                      return (
                        <div
                          key={order._id}
                          className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-sm font-bold text-primary">
                                #{order._id.slice(-8).toUpperCase()}
                              </span>
                              {order.paymentCode && (
                                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded font-semibold text-foreground">
                                  {order.paymentCode}
                                </span>
                              )}
                              {isNewest && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                                  <Sparkles className="size-3" />
                                  Mới nhất
                                </span>
                              )}
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${st.color}`}
                              >
                                {st.label}
                              </span>
                              <span
                                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                                  isPaid
                                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                    : "bg-amber-100 text-amber-800 border-amber-300"
                                }`}
                              >
                                {isPaid ? "Đã thanh toán" : "Chưa thanh toán"}
                              </span>
                            </div>

                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="size-3.5" />
                              {new Date(order.createdAt).toLocaleString("vi-VN")}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-sm font-medium text-foreground">
                              {order.items.map((item) => `${item.name} × ${item.qty}`).join(", ")}
                            </p>
                            <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2.5">
                              <span className="text-xs text-muted-foreground">Tổng thanh toán:</span>
                              <span className="font-serif text-base font-bold text-primary">
                                {order.total.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Thanh phân trang Pagination */}
                  {orders.length > ORDERS_PER_PAGE && (
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4 text-xs">
                      <span className="text-muted-foreground">
                        Hiển thị {(safeOrderPage - 1) * ORDERS_PER_PAGE + 1} -{" "}
                        {Math.min(safeOrderPage * ORDERS_PER_PAGE, orders.length)} / {orders.length} đơn
                      </span>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrderPage((prev) => Math.max(1, prev - 1))}
                          disabled={safeOrderPage <= 1}
                          className="h-8 gap-1 px-2.5"
                        >
                          <ChevronLeft className="size-3.5" />
                          Trước
                        </Button>

                        <div className="flex items-center gap-1">
                          {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              type="button"
                              onClick={() => setOrderPage(page)}
                              className={`size-8 rounded-md text-xs font-semibold transition-colors ${
                                page === safeOrderPage
                                  ? "bg-primary text-primary-foreground"
                                  : "border border-border bg-background text-foreground hover:bg-muted"
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setOrderPage((prev) => Math.min(totalOrderPages, prev + 1))}
                          disabled={safeOrderPage >= totalOrderPages}
                          className="h-8 gap-1 px-2.5"
                        >
                          Sau
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  )
}