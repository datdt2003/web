import type { Metadata } from "next"
import { SectionHeading } from "@/components/section-heading"
import { MapExplorer } from "@/components/map-explorer"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { ethnicGroups, type Ethnic as EthnicType } from "@/lib/ethnic-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Bản đồ phân bố 54 dân tộc | Hồn Y Đất Việt",
  description:
    "Bản đồ phân bố 54 dân tộc Việt Nam. Tìm một dân tộc, bản đồ sẽ đánh dấu những vùng họ sinh sống nhiều nhất trên khắp ba miền Bắc – Trung – Nam.",
}

export default async function BanDoPage() {
  let initialEthnics: EthnicType[] = ethnicGroups
  try {
    await connectDB()
    const rawDbEthnics = await Ethnic.find().sort({ population: -1 }).lean()
    const dbEthnics = JSON.parse(JSON.stringify(rawDbEthnics))
    if (dbEthnics && dbEthnics.length > 0) {
      const dbMap = new Map(dbEthnics.map((e: any) => [e.slug, e]))
      initialEthnics = ethnicGroups.map((staticItem) => {
        const dbItem = dbMap.get(staticItem.slug)
        const item: EthnicType = dbItem ? { ...staticItem, ...dbItem, slug: staticItem.slug } : staticItem
        delete (item as any)._id
        return item
      })
      for (const dbItem of dbEthnics as any[]) {
        if (!ethnicGroups.some((e) => e.slug === dbItem.slug)) {
          const item = { ...dbItem }
          delete item._id
          initialEthnics.push(item as EthnicType)
        }
      }
    }
  } catch (error) {
    console.error("BanDoPage DB load error, using static fallback:", error)
  }

  return (
    <section className="py-14 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading
          center
          eyebrow="Bản đồ Việt Nam"
          title="Phân bố các dân tộc trên dải đất hình chữ S"
          description="Nhập tên một dân tộc — bản đồ sẽ đánh dấu những vùng họ sinh sống nhiều nhất. Có dân tộc chỉ ở một vùng, có dân tộc như người Kinh trải khắp cả ba miền."
        />
        <div className="mt-12">
          <MapExplorer initialEthnics={initialEthnics} />
        </div>
      </div>
    </section>
  )
}

