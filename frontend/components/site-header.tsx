"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, ShoppingCart, Star, User as UserIcon, LogOut, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { useCart } from "@/components/providers/cart-provider"
import { useAuth } from "@/components/providers/auth-provider"
import { cn } from "@/lib/utils"

const nav = [
  { href: "/", label: "Trang chủ" },
  { href: "/dan-toc", label: "54 Dân tộc" },
  { href: "/ban-do", label: "Bản đồ" },
  { href: "/gioi-thieu", label: "Giới thiệu" },
]

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(href + "/")
}

export function SiteHeader() {
  const pathname = usePathname()
  const { count } = useCart()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="h-1 w-full bg-primary" />
      <div className="border-b border-border bg-background/90 backdrop-blur-md">
        {/* Desktop header: Logo (trái) | Nav (giữa) | Cart + User + Logout (phải) */}
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:grid md:grid-cols-[1fr_auto_1fr]">

          {/* Logo */}
          <div className="flex items-center justify-start">
            <Link href="/" className="flex shrink-0 items-center gap-2.5 group" onClick={() => setOpen(false)}>
              <div className="relative size-10 overflow-hidden rounded-full border border-border shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Hồn Y Đất Việt"
                  width={40}
                  height={40}
                  className="size-full object-cover"
                  priority
                />
              </div>
              <span className="flex flex-col leading-none">
                <span className="font-serif text-lg font-bold text-primary tracking-tight">Hồn Y Đất Việt</span>
                <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  54 Dân tộc
                </span>
              </span>
            </Link>
          </div>

          {/* Nav — căn giữa */}
          <nav className="hidden items-center justify-center gap-1 md:flex">
            {nav.map((item) => {
              const active = isActive(item.href, pathname)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary",
                    active && "bg-primary/10 font-semibold text-primary",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
            {user?.role === "admin" && (
              <Link
                href="/admin"
                aria-current={isActive("/admin", pathname) ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-muted hover:text-primary",
                  isActive("/admin", pathname) && "bg-primary/10 font-semibold text-primary",
                )}
              >
                Quản trị
              </Link>
            )}
          </nav>

          {/* Cụm sát lề phải: Giỏ hàng + Tên tài khoản + Đăng xuất (hoặc Đăng nhập / Đăng ký) */}
          <div className="flex items-center justify-end gap-3">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon-lg"
              className="md:hidden"
              onClick={() => setOpen((v) => !v)}
              aria-label="Menu"
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </Button>

            {/* Giỏ hàng (luôn hiển thị cho cả khách vãng lai và thành viên) */}
            <Link
              href="/gio-hang"
              aria-label="Giỏ hàng"
              className={cn(buttonVariants({ variant: "ghost", size: "icon-lg" }), "relative")}
            >
              <ShoppingCart className="size-5" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {count}
                </span>
              )}
            </Link>

            {/* Tên tài khoản */}
            {user && (
              <span className="hidden items-center gap-1.5 text-sm font-medium md:flex">
                <UserIcon className="size-4 text-primary" />
                <Link href="/tai-khoan" className="hover:text-primary">
                  {user.name}
                </Link>
              </span>
            )}

            {/* Nút Đăng xuất */}
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="hidden md:inline-flex ml-1"
              >
                <LogOut className="size-4" />
                Đăng xuất
              </Button>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link href="/dang-nhap" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Đăng nhập
                </Link>
                <Link
                  href="/dang-ky"
                  className={cn(buttonVariants({ size: "sm" }), "bg-primary text-primary-foreground")}
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="mx-auto flex max-w-6xl flex-col px-4 py-2">
              {nav.map((item) => {
                const active = isActive(item.href, pathname)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-3 text-sm font-medium hover:bg-muted",
                      active && "bg-primary/10 font-semibold text-primary",
                    )}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  aria-current={isActive("/admin", pathname) ? "page" : undefined}
                  className={cn(
                    "rounded-md px-3 py-3 text-sm font-medium hover:bg-muted",
                    isActive("/admin", pathname) && "bg-primary/10 font-semibold text-primary",
                  )}
                >
                  Quản trị
                </Link>
              )}
              <Link
                href="/gio-hang"
                onClick={() => setOpen(false)}
                aria-current={isActive("/gio-hang", pathname) ? "page" : undefined}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-3 text-sm font-medium hover:bg-muted",
                  isActive("/gio-hang", pathname) && "bg-primary/10 font-semibold text-primary",
                )}
              >
                <span className="flex items-center gap-2">
                  <ShoppingCart className="size-4 text-primary" />
                  Giỏ hàng
                </span>
                {count > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                    {count}
                  </span>
                )}
              </Link>
              <div className="my-2 h-px bg-border" />
              {user ? (
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    logout()
                    setOpen(false)
                  }}
                >
                  <LogOut className="size-4" />
                  Đăng xuất ({user.name})
                </Button>
              ) : (
                <div className="flex gap-2 pb-2">
                  <Link
                    href="/dang-nhap"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline" }), "flex-1")}
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    href="/dang-ky"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants(), "flex-1 bg-primary text-primary-foreground")}
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
