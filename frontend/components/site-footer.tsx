import Link from "next/link"
import Image from "next/image"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3">
            <div className="relative size-11 overflow-hidden rounded-full border border-primary-foreground/20 bg-white/10 shadow-sm">
              <Image
                src="/logo.png"
                alt="Hồn Y Đất Việt"
                width={44}
                height={44}
                className="size-full object-cover"
              />
            </div>
            <span className="font-serif text-xl font-bold tracking-tight">Hồn Y Đất Việt</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-foreground/80">
            Hành trình khám phá bản sắc văn hóa 54 dân tộc anh em trên dải đất
            hình chữ S. Gìn giữ và lan tỏa những giá trị truyền thống Việt Nam.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Khám phá</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link href="/" className="hover:text-primary-foreground">Trang chủ</Link></li>
            <li><Link href="/dan-toc" className="hover:text-primary-foreground">54 Dân tộc</Link></li>
            <li><Link href="/#ban-do" className="hover:text-primary-foreground">Bản đồ Việt Nam</Link></li>
            <li><Link href="/gio-hang" className="hover:text-primary-foreground">Giỏ hàng</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold">Tài khoản</h3>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link href="/dang-nhap" className="hover:text-primary-foreground">Đăng nhập</Link></li>
            <li><Link href="/dang-ky" className="hover:text-primary-foreground">Đăng ký</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs text-primary-foreground/70">
          © {new Date().getFullYear()} Hồn Y Đất Việt — Bảo tồn văn hóa 54 dân tộc Việt Nam.
        </div>
      </div>
    </footer>
  )
}
