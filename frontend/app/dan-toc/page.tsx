import { Suspense } from "react"
import { SectionHeading } from "@/components/section-heading"
import { EthnicBrowser } from "@/components/ethnic-browser"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { ethnicGroups, type Ethnic as EthnicType } from "@/lib/ethnic-data"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata = {
  title: "54 Dân tộc Việt Nam — Hồn Y Đất Việt",
  description: "Danh sách và video giới thiệu 54 dân tộc anh em của Việt Nam.",
}

export default async function DanTocPage() {
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
    console.error("DanTocPage DB load error, using static fallback:", error)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        eyebrow="Thư viện văn hóa"
        title="54 Dân tộc Việt Nam"
        description="Bấm vào một dân tộc để xem video giới thiệu và tìm hiểu chi tiết về văn hóa, phong tục và sản phẩm truyền thống của họ."
      />
      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải...</p>}>
          <EthnicBrowser initialEthnics={initialEthnics} />
        </Suspense>
      </div>
    </div>
  )
}
