import { Suspense } from "react"
import { SectionHeading } from "@/components/section-heading"
import { EthnicBrowser } from "@/components/ethnic-browser"

export const metadata = {
  title: "54 Dân tộc Việt Nam — Sắc Việt",
  description: "Danh sách và video giới thiệu 54 dân tộc anh em của Việt Nam.",
}

export default function DanTocPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <SectionHeading
        eyebrow="Thư viện văn hóa"
        title="54 Dân tộc Việt Nam"
        description="Bấm vào một dân tộc để xem video giới thiệu và tìm hiểu chi tiết về văn hóa, phong tục và sản phẩm truyền thống của họ."
      />
      <div className="mt-10">
        <Suspense fallback={<p className="text-sm text-muted-foreground">Đang tải...</p>}>
          <EthnicBrowser />
        </Suspense>
      </div>
    </div>
  )
}
