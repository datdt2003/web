import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Be_Vietnam_Pro, Lora } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { CartProvider } from '@/components/providers/cart-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ContactBubble } from '@/components/contact-bubble'

const beVietnam = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-be-vietnam',
})

const lora = Lora({
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  variable: '--font-lora',
})

export const metadata: Metadata = {
  title: 'Hồn Y Đất Việt — Văn hóa 54 dân tộc Việt Nam',
  description:
    'Khám phá bản sắc, video và câu chuyện văn hóa của 54 dân tộc anh em trên khắp dải đất hình chữ S.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#DA251D',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`light ${beVietnam.variable} ${lora.variable}`}>
      <body className="bg-background font-sans antialiased">
        <AuthProvider>
          <CartProvider>
            <SiteHeader />
            <main className="min-h-[60vh]">{children}</main>
            <SiteFooter />
            <ContactBubble />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
