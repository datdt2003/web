import Image from "next/image"
import Link from "next/link"
import { Star, ChevronRight, Play, Sparkles } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { EthnicCard } from "@/components/ethnic-card"
import { VietnamMap } from "@/components/vietnam-map"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { ethnicGroups, type Ethnic as EthnicType } from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"
export const revalidate = 0

const featuredSlugs = ["kinh", "hmong", "thai", "cham", "e-de", "khmer", "tay", "dao"]

const stats = [
  { value: "54", label: "Dân tộc anh em" },
  { value: "8", label: "Nhóm ngôn ngữ" },
  { value: "63", label: "Tỉnh thành" },
  { value: "100M+", label: "Dân số" },
]

export default async function HomePage() {
  let featured: EthnicType[] = featuredSlugs
    .map((s) => ethnicGroups.find((e) => e.slug === s))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))

  let allEthnics: EthnicType[] = ethnicGroups

  try {
    await connectDB()
    const dbEthnics = await Ethnic.find().lean()
    if (dbEthnics && dbEthnics.length > 0) {
      const dbMap = new Map(dbEthnics.map((e: any) => [e.slug, e]))
      allEthnics = ethnicGroups.map((staticItem) => {
        const dbItem = dbMap.get(staticItem.slug)
        return dbItem ? { ...staticItem, ...dbItem } : staticItem
      })
      featured = featuredSlugs
        .map((s) => {
          const staticItem = ethnicGroups.find((e) => e.slug === s)
          const dbItem = dbMap.get(s)
          if (!staticItem && !dbItem) return null
          return dbItem ? { ...staticItem, ...dbItem } : staticItem
        })
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    }
  } catch (error) {
    console.error("HomePage load ethnics error, using static fallback:", error)
  }

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero-ethnic.png"
            alt="Cộng đồng các dân tộc Việt Nam"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/70 to-primary/30" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-24 md:py-32">
          <div className="max-w-2xl text-primary-foreground">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Star className="size-3.5 fill-gold text-gold" />
              Bản sắc văn hóa Việt Nam
            </span>
            <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight md:text-6xl">
              54 Dân tộc anh em, một cội nguồn Việt Nam
            </h1>
            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/90 md:text-lg">
              Khám phá video, câu chuyện và di sản văn hóa của từng dân tộc trải
              dài trên khắp dải đất hình chữ S — từ miền núi phía Bắc đến đồng
              bằng sông Cửu Long.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dan-toc"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "bg-gold text-gold-foreground [a]:hover:bg-gold/90",
                )}
              >
                <Play className="size-4 fill-current" />
                Khám phá các dân tộc
              </Link>
              <Link
                href="/ban-do"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "border-primary-foreground/40 bg-transparent text-primary-foreground [a]:hover:bg-primary-foreground/10",
                )}
              >
                Xem bản đồ
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative border-t border-primary-foreground/15 bg-primary/80 backdrop-blur">
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="text-center text-primary-foreground">
                <div className="font-serif text-3xl font-bold text-gold md:text-4xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Intro */}
      <section id="gioi-thieu" className="scroll-mt-20 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/images/ethnic-hmong.png"
              alt="Trang phục truyền thống dân tộc"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
            <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-background/90 p-4 backdrop-blur">
              <p className="font-serif text-sm font-semibold text-foreground">
                &ldquo;Mỗi dân tộc là một sắc màu riêng, hòa quyện nên bức tranh
                văn hóa Việt Nam.&rdquo;
              </p>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Về dự án"
              title="Gìn giữ và lan tỏa di sản của cộng đồng các dân tộc"
              description="Hồn Y Đất Việt là hành trình số hóa văn hóa 54 dân tộc — nơi mỗi dân tộc có một trang riêng với video giới thiệu, câu chuyện về phong tục, trang phục, lễ hội và những sản phẩm thủ công truyền thống."
            />
            <ul className="mt-6 space-y-4">
              {[
                { t: "Video tư liệu", d: "Mỗi dân tộc có video giới thiệu về đời sống và văn hóa đặc trưng." },
                { t: "Câu chuyện văn hóa", d: "Tìm hiểu phong tục, lễ hội, trang phục và ngôn ngữ của từng cộng đồng." },
                { t: "Sản phẩm truyền thống", d: "Ủng hộ nghề thủ công qua các sản phẩm thổ cẩm, nhạc cụ, gốm sứ." },
              ].map((f) => (
                <li key={f.t} className="flex gap-4">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </span>
                  <div>
                    <h3 className="font-semibold text-foreground">{f.t}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.d}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Map */}
      <section id="ban-do" className="scroll-mt-20 bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            center
            eyebrow="Bản đồ Việt Nam"
            title="Các dân tộc trải dài khắp mọi miền Tổ quốc"
            description="Chọn một vùng miền trên bản đồ để khám phá các dân tộc sinh sống tại đó."
          />
          <div className="mt-12">
            <VietnamMap ethnics={allEthnics} />
          </div>
        </div>
      </section>

      {/* Featured ethnic groups */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading
              eyebrow="Tiêu biểu"
              title="Khám phá các dân tộc"
              description="Bấm vào một dân tộc để xem video và tìm hiểu chi tiết về văn hóa của họ."
            />
            <Link
              href="/dan-toc"
              className={cn(buttonVariants({ variant: "outline" }), "shrink-0")}
            >
              Xem tất cả 54 dân tộc
              <ChevronRight className="size-4" />
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-5 md:grid-cols-4">
            {featured.map((e) => (
              <EthnicCard key={e.slug} ethnic={e} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="pb-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
            <Star className="absolute -left-6 -top-6 size-32 text-primary-foreground/10" />
            <Star className="absolute -bottom-8 -right-4 size-40 text-primary-foreground/10" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
                Cùng gìn giữ bản sắc văn hóa Việt Nam
              </h2>
              <p className="mt-4 text-pretty text-primary-foreground/90">
                Tạo tài khoản để lưu lại các dân tộc yêu thích và ủng hộ sản phẩm
                thủ công truyền thống.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/dang-ky"
                  className={cn(buttonVariants({ size: "lg" }), "bg-gold text-gold-foreground [a]:hover:bg-gold/90")}
                >
                  Đăng ký ngay
                </Link>
                <Link
                  href="/dan-toc"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-primary-foreground/40 bg-transparent text-primary-foreground [a]:hover:bg-primary-foreground/10",
                  )}
                >
                  Khám phá ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
