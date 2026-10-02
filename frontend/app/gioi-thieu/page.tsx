import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Video,
  MapPin,
  BookOpen,
  ShoppingBag,
  HeartHandshake,
  Landmark,
  Users,
  ChevronRight,
} from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { SectionHeading } from "@/components/section-heading"
import { ethnicGroups } from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Giới thiệu dự án | Hồn Y Đất Việt",
  description:
    "Hồn Y Đất Việt là dự án số hóa và lan tỏa di sản văn hóa của 54 dân tộc anh em trên khắp Việt Nam qua video, câu chuyện, bản đồ và sản phẩm truyền thống.",
}

const features = [
  {
    icon: Video,
    title: "Video tư liệu",
    desc: "Mỗi dân tộc có một trang riêng với video giới thiệu về đời sống, nghi lễ và nghệ thuật đặc trưng.",
  },
  {
    icon: BookOpen,
    title: "Câu chuyện văn hóa",
    desc: "Tư liệu về phong tục, lễ hội, trang phục, ngôn ngữ và tín ngưỡng của từng cộng đồng.",
  },
  {
    icon: MapPin,
    title: "Bản đồ phân bố 3D",
    desc: "Trực quan hóa nơi sinh sống của mỗi dân tộc trên khắp ba miền Bắc – Trung – Nam.",
  },
  {
    icon: ShoppingBag,
    title: "Sản phẩm truyền thống",
    desc: "Gian hàng thổ cẩm, nhạc cụ, gốm sứ… giúp ủng hộ trực tiếp các nghệ nhân và làng nghề.",
  },
]

const values = [
  {
    icon: HeartHandshake,
    title: "Gìn giữ",
    desc: "Lưu trữ số hóa các giá trị văn hóa đang có nguy cơ mai một theo thời gian.",
  },
  {
    icon: Users,
    title: "Kết nối",
    desc: "Đưa văn hóa các dân tộc đến gần hơn với thế hệ trẻ và bạn bè quốc tế.",
  },
  {
    icon: Landmark,
    title: "Tôn vinh",
    desc: "Khẳng định sự bình đẳng và vẻ đẹp riêng của mỗi dân tộc trong đại gia đình Việt Nam.",
  },
]

const stats = [
  { value: "54", label: "Dân tộc anh em" },
  { value: "8", label: "Nhóm ngôn ngữ" },
  { value: "63", label: "Tỉnh thành" },
  { value: "100M+", label: "Dân số" },
]

export default function GioiThieuPage() {
  const totalPopulation = ethnicGroups.reduce((sum, e) => sum + e.population, 0)

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-20">
          <Image src="/images/hero-ethnic.png" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <Star className="absolute -left-8 -top-8 size-40 text-primary-foreground/10" />
        <Star className="absolute -bottom-10 right-4 size-48 text-primary-foreground/10" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center md:py-28">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Star className="size-3.5 fill-gold text-gold" />
            Về dự án Hồn Y Đất Việt
          </span>
          <h1 className="mt-5 text-balance font-serif text-4xl font-bold leading-tight md:text-5xl">
            Số hóa di sản của 54 dân tộc anh em
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty leading-relaxed text-primary-foreground/90 md:text-lg">
            Hồn Y Đất Việt là một dự án văn hóa phi lợi nhuận, ra đời với mong muốn lưu
            giữ, tôn vinh và lan tỏa vẻ đẹp bản sắc của cộng đồng các dân tộc trên
            khắp dải đất hình chữ S.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-border shadow-lg">
            <Image
              src="/images/ethnic-thai.png"
              alt="Văn hóa truyền thống các dân tộc Việt Nam"
              fill
              sizes="(max-width: 1024px) 90vw, 45vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow="Sứ mệnh"
              title="Mỗi dân tộc là một sắc màu của Việt Nam"
              description="Việt Nam là quốc gia đa dân tộc với 54 cộng đồng, mỗi cộng đồng mang một ngôn ngữ, trang phục, tín ngưỡng và kho tàng nghệ thuật riêng. Nhiều giá trị trong số đó đang dần mai một trước nhịp sống hiện đại."
            />
            <p className="mt-4 leading-relaxed text-muted-foreground">
              Hồn Y Đất Việt tập hợp những tư liệu ấy vào một không gian số duy nhất —
              nơi bất kỳ ai cũng có thể tìm hiểu, xem video và ủng hộ các nghệ
              nhân, góp phần để di sản được tiếp nối cho các thế hệ mai sau.
            </p>
          </div>
        </div>
      </section>

      {/* Stats band */}
      <section className="bg-primary py-12 text-primary-foreground">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-serif text-4xl font-bold text-gold">{s.value}</div>
              <div className="mt-1 text-xs font-medium uppercase tracking-wide text-primary-foreground/80">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            center
            eyebrow="Dự án có gì"
            title="Khám phá văn hóa theo nhiều cách"
            description="Bốn trải nghiệm chính giúp bạn đến gần hơn với văn hóa của 54 dân tộc."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-md"
              >
                <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeading
            center
            eyebrow="Giá trị cốt lõi"
            title="Vì sao Hồn Y Đất Việt tồn tại"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map((v) => (
              <div key={v.title} className="text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
                  <v.icon className="size-7" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-bold text-foreground">{v.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
            Dự án hiện lưu giữ thông tin của{" "}
            <span className="font-semibold text-foreground">{ethnicGroups.length} dân tộc</span> với
            tổng dân số hơn{" "}
            <span className="font-semibold text-foreground">
              {totalPopulation.toLocaleString("vi-VN")}
            </span>{" "}
            người trên cả nước.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-center text-primary-foreground md:px-12">
            <Star className="absolute -left-6 -top-6 size-32 text-primary-foreground/10" />
            <Star className="absolute -bottom-8 -right-4 size-40 text-primary-foreground/10" />
            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
                Bắt đầu hành trình khám phá
              </h2>
              <p className="mt-4 text-pretty text-primary-foreground/90">
                Xem video, tìm hiểu văn hóa và ủng hộ sản phẩm truyền thống của
                54 dân tộc anh em.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link
                  href="/dan-toc"
                  className={cn(buttonVariants({ size: "lg" }), "bg-gold text-gold-foreground [a]:hover:bg-gold/90")}
                >
                  Khám phá 54 dân tộc
                  <ChevronRight className="size-4" />
                </Link>
                <Link
                  href="/ban-do"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "border-primary-foreground/40 bg-transparent text-primary-foreground [a]:hover:bg-primary-foreground/10",
                  )}
                >
                  Xem bản đồ phân bố
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
