"use client"

import Link from "next/link"
import { useState } from "react"
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [sent, setSent] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setSent(true)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setMessage(data.message)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể gửi mã.")
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword(event: React.FormEvent) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setMessage(data.message)
      setCode("")
      setNewPassword("")
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Không thể đổi mật khẩu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-16">
      <div className="w-full">
        <div className="mb-8 grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Mail className="size-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Quên mật khẩu</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Nhập email để nhận mã xác nhận đổi mật khẩu.
        </p>

        {error && (
          <div className="mt-5 flex gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="mt-5 flex gap-2 rounded-lg border border-primary/20 bg-primary/10 p-3 text-sm text-primary">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={requestCode} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="reset-email" className="text-sm font-medium">Email</label>
            <Input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && !sent ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {sent ? "Gửi lại mã xác nhận" : "Gửi mã xác nhận"}
          </Button>
        </form>

        {sent && (
          <form onSubmit={resetPassword} className="mt-8 space-y-4 border-t border-border pt-8">
            <div className="space-y-1.5">
              <label htmlFor="reset-code" className="text-sm font-medium">Mã xác nhận</label>
              <Input id="reset-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} required disabled={loading} />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="new-password" className="text-sm font-medium">Mật khẩu mới</label>
              <Input id="new-password" type="password" minLength={6} value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Đổi mật khẩu
            </Button>
          </form>
        )}

        <Link href="/dang-nhap" className="mt-8 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" /> Quay lại đăng nhập
        </Link>
      </div>
    </main>
  )
}