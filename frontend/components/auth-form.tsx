"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Star, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/providers/auth-provider"

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter()
  const { login, register } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isRegister = mode === "register"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const res = isRegister
        ? await register(name, email, password)
        : await login(email, password)

      if (res.success) {
        router.push("/")
        router.refresh()
      } else {
        setError(res.error || "Thao tác không thành công.")
      }
    } catch {
      setError("Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="grid lg:grid-cols-2"
      style={{ minHeight: "calc(100dvh - 4rem)" }}
    >
      {/* Visual side */}
      <div
        className="relative hidden overflow-hidden bg-primary lg:block"
        style={{ minHeight: "calc(100dvh - 4rem)" }}
      >
        <Image
          src="/images/hero-ethnic.png"
          alt="Văn hóa các dân tộc Việt Nam"
          fill
          sizes="50vw"
          className="scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-primary/30" />
        <div className="absolute bottom-12 left-12 right-12 text-primary-foreground">
          <Star className="size-10 fill-gold text-gold" />
          <h2 className="mt-4 font-serif text-3xl font-bold leading-tight">
            Hành trình khám phá văn hóa 54 dân tộc Việt Nam
          </h2>
          <p className="mt-3 max-w-md text-primary-foreground/85">
            Đăng nhập để lưu các dân tộc yêu thích và trải nghiệm/khám phá sản phẩm mô hình Hồn Y Đất Việt.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-3">
            <div className="relative size-11 overflow-hidden rounded-full border border-border shadow-sm">
              <Image
                src="/logo.png"
                alt="Hồn Y Đất Việt"
                width={44}
                height={44}
                className="size-full object-cover"
                priority
              />
            </div>
            <span className="font-serif text-xl font-bold text-primary tracking-tight">Hồn Y Đất Việt</span>
          </div>

          <h1 className="mt-8 font-serif text-3xl font-bold text-foreground">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Tham gia cộng đồng gìn giữ văn hóa Việt Nam."
              : "Chào mừng bạn trở lại với Hồn Y Đất Việt."}
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isRegister && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium text-foreground">
                  Họ và tên
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mật khẩu
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary text-primary-foreground"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : isRegister ? (
                "Đăng ký"
              ) : (
                "Đăng nhập"
              )}
            </Button>
          </form>

          {!isRegister && (
            <Link
              href="/quen-mat-khau"
              className="mt-4 block text-center text-sm font-medium text-primary hover:underline"
            >
              Quên mật khẩu?
            </Link>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            <Link
              href={isRegister ? "/dang-nhap" : "/dang-ky"}
              className="font-semibold text-primary hover:underline"
            >
              {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
