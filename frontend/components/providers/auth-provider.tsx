"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

export interface User {
  id?: string
  name: string
  email: string
  role?: "user" | "admin"
}

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  updateProfile: (name: string, email: string, currentPassword?: string, newPassword?: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Kiểm tra phiên đăng nhập hiện tại khi tải trang
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" })
        if (res.ok) {
          const data = await res.json()
          if (data.user) {
            setUser(data.user)
          }
        }
      } catch (err) {
        console.error("Failed to fetch current user:", err)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng nhập thất bại." }
      }
      setUser(data.user)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: "Không thể kết nối máy chủ." }
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        return { success: false, error: data.error || "Đăng ký thất bại." }
      }
      setUser(data.user)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: "Không thể kết nối máy chủ." }
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    } finally {
      setUser(null)
      // Xóa giỏ hàng khi đăng xuất để bảo mật và tránh lưu giỏ hàng của tài khoản cũ
      try {
        localStorage.removeItem("sac_viet_cart_items_v1")
        window.dispatchEvent(new Event("cart_cleared"))
      } catch (e) {
        console.error("Lỗi xóa giỏ hàng khi đăng xuất:", e)
      }
    }
  }


  const updateProfile = async (name: string, email: string, currentPassword = "", newPassword = "") => {
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, currentPassword, newPassword }),
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error || "Cập nhật thất bại." }
      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, error: "Không thể kết nối máy chủ." }
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
