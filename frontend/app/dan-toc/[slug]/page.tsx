import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronRight, Users, Languages, MapPin, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { VideoPlayer } from "@/components/video-player"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { Product } from "@/models/Product"
import { ProductCard } from "@/components/product-card"
import { EthnicCard } from "@/components/ethnic-card"
import {
  ethnicGroups,
  getEthnic,
  regionLabel,
  regionsForEthnic,
  productsForEthnic,
  type Product as ProductData,
} from "@/lib/ethnic-data"
import { cn } from "@/lib/utils"

export function generateStaticParams() {
  return ethnicGroups.map((e) => ({ slug: e.slug }))
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ethnic = getEthnic(slug)
  if (!ethnic) return { title: "Không tìm thấy — Hồn Y Đất Việt" }
  return {
    title: `Dân tộc ${ethnic.name} — Hồn Y Đất Việt`,
    description: ethnic.blurb,
  }
}

export default async function EthnicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const fallbackEthnic = getEthnic(slug)
  if (!fallbackEthnic) notFound()

  let ethnic = fallbackEthnic
  try {
    await connectDB()
    const rawDatabaseEthnic = await Ethnic.findOne({ slug }).lean()
    if (rawDatabaseEthnic) {
      const databaseEthnic = JSON.parse(JSON.stringify(rawDatabaseEthnic))
      ethnic = { ...fallbackEthnic, ...databaseEthnic, slug: fallbackEthnic.slug }
    }
  } catch (error) {
    console.error("Load ethnic page data error:", error)
  }

  // Lấy sản phẩm thuộc dân tộc từ cơ sở dữ liệu, nếu không có thì fallback sang dữ liệu mẫu
  let displayProducts: any[] = []
  try {
    await connectDB()
    const rawDbProducts = await Product.find({ ethnicSlug: ethnic.slug }).lean()
    if (rawDbProducts && rawDbProducts.length > 0) {
      displayProducts = JSON.parse(JSON.stringify(rawDbProducts))
    }
  } catch (error) {
    console.error("Load ethnic products from DB error:", error)
  }

  if (displayProducts.length === 0) {
    displayProducts = productsForEthnic(ethnic.slug)
  }

  // Nếu vẫn không có sản phẩm nào, tạo sản phẩm di sản mặc định
  if (displayProducts.length === 0) {
    const traditionalName = ethnic.culture[0] || "Nghề thủ công"
    displayProducts = [
      {
        id: `heritage-${ethnic.slug}`,
        name: `${traditionalName} truyền thống ${ethnic.name}`,
        price: 0,
        image: ethnic.image,
        ethnicSlug: ethnic.slug,
        category: "Di sản thủ công",
        description: `Nét văn hóa tiêu biểu của cộng đồng ${ethnic.name}.`,
        forSale: false,
      },
    ]
  }

  let related = ethnicGroups
    .filter(
      (e) =>
        e.slug !== ethnic.slug &&
        regionsForEthnic(e).some((region) => regionsForEthnic(ethnic).includes(region)),
    )
    .slice(0, 4)

  try {
    const relatedSlugs = related.map((r) => r.slug)
    const rawDbRelated = await Ethnic.find({ slug: { $in: relatedSlugs } }).lean()
    const dbRelated = JSON.parse(JSON.stringify(rawDbRelated))
    if (dbRelated && dbRelated.length > 0) {
      const dbRelatedMap = new Map(dbRelated.map((r: any) => [r.slug, r]))
      related = related.map((r) => {
        const item = dbRelatedMap.get(r.slug)
        if (item) {
          delete (item as any)._id
          return { ...r, ...item }
        }
        return r
      })
    }
  } catch (e) {
    console.error("Load related ethnics error:", e)
  }

  const residenceValue =
    ethnic.residenceArea ||
    (ethnic.regions && ethnic.regions.length === 3
      ? "Cả 3 miền (Toàn quốc)"
      : regionsForEthnic(ethnic).map(regionLabel).join(" · "))

  const facts = [
    { icon: Users, label: "Dân số", value: `${ethnic.population.toLocaleString("vi-VN")} người` },
    { icon: Languages, label: "Nhóm ngôn ngữ", value: ethnic.languageFamily },
    {
      icon: MapPin,
      label: "Vùng cư trú",
      value: residenceValue,
    },
    { icon: Home, label: "Tên gọi khác", value: ethnic.altNames || ethnic.name },
  ]

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border bg-muted/40">
        <div className="mx-auto flex max-w-6xl items-center gap-1.5 px-4 py-3 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">Trang chủ</Link>
          <ChevronRight className="size-3.5" />
          <Link href="/dan-toc" className="hover:text-primary">54 Dân tộc</Link>
          <ChevronRight className="size-3.5" />
          <span className="font-medium text-foreground">{ethnic.name}</span>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Title */}
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
            Dân tộc {ethnic.name}
          </h1>
          {ethnic.altNames && (
            <p className="mt-1 text-muted-foreground">Còn gọi là: {ethnic.altNames}</p>
          )}
        </div>

        <div className="grid items-start gap-10 lg:grid-cols-[1.5fr_1fr]">
          {/* Left: video + description */}
          <div>
            <VideoPlayer poster={ethnic.image} title={ethnic.name} videoUrl={ethnic.videoUrl} />

            <div className="mt-8 space-y-4">
              <h2 className="font-serif text-2xl font-bold text-foreground">Giới thiệu</h2>
              <p className="leading-relaxed text-foreground/85">{ethnic.detail}</p>
              <p className="leading-relaxed text-muted-foreground">{ethnic.blurb}</p>
            </div>

            <div className="mt-8">
              <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">
                Nét văn hóa đặc trưng
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {ethnic.culture.map((c) => (
                  <span
                    key={c}
                    className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground shadow-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: quick facts */}
          <aside className="self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <h2 className="font-serif text-xl font-bold text-foreground">Thông tin chi tiết</h2>
              <dl className="mt-5 space-y-4">
                {facts.map((f) => (
                  <div key={f.label} className="flex items-start gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                      <f.icon className="size-5" />
                    </span>
                    <div className="flex-1">
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {f.label}
                      </dt>
                      <dd className="font-semibold leading-relaxed text-foreground">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <Link
                href="/dan-toc"
                className={cn(buttonVariants({ variant: "outline" }), "mt-6 w-full")}
              >
                Xem các dân tộc khác
              </Link>
            </div>
          </aside>
        </div>

        {/* Products */}
        <section className="mt-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
                {["tay", "thai", "muong", "nung", "khmer", "hmong"].includes(ethnic.slug)
                  ? "Sản phẩm trưng bày"
                  : "Sản phẩm truyền thống"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {["tay", "thai", "muong", "nung", "khmer", "hmong"].includes(ethnic.slug)
                  ? `Khám phá các sản phẩm thủ công tiêu biểu của đồng bào dân tộc ${ethnic.name}. Có thể thêm trực tiếp vào giỏ hàng để sở hữu hoặc làm quà tặng lưu niệm.`
                  : `Tìm hiểu những sản phẩm thủ công và giá trị văn hóa của cộng đồng dân tộc ${ethnic.name}.`}
              </p>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
            {displayProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              Dân tộc cùng vùng miền
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">
              {related.map((e) => (
                <EthnicCard key={e.slug} ethnic={e} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
