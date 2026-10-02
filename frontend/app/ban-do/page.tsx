import type { Metadata } from "next"
import { SectionHeading } from "@/components/section-heading"
import { MapExplorer } from "@/components/map-explorer"

export const metadata: Metadata = {
  title: "Bản đồ phân bố 54 dân tộc | Sắc Việt",
  description:
    "Bản đồ phân bố 54 dân tộc Việt Nam. Tìm một dân tộc, bản đồ sẽ đánh dấu những vùng họ sinh sống nhiều nhất trên khắp ba miền Bắc – Trung – Nam.",
}

export default function BanDoPage() {
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
          <MapExplorer />
        </div>
      </div>
    </section>
  )
}
