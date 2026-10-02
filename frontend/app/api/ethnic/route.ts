import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { ethnicGroups, regionsForEthnic, type RegionId } from "@/lib/ethnic-data"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const region = searchParams.get("region")
  const q = searchParams.get("q")?.trim()

  try {
    await connectDB()

    const filter: Record<string, any> = {}

    if (region && ["bac", "trung", "nam"].includes(region)) {
      filter.region = region
    }

    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { altNames: { $regex: q, $options: "i" } },
        { blurb: { $regex: q, $options: "i" } },
      ]
    }

    const ethnics = await Ethnic.find(filter).sort({ population: -1 }).lean()

    if (ethnics && ethnics.length > 0) {
      return NextResponse.json({
        success: true,
        count: ethnics.length,
        data: ethnics,
      })
    }
  } catch (error: any) {
    console.error("Get ethnics error, falling back to static data:", error)
  }

  // Fallback sang dữ liệu tĩnh chuẩn 54 dân tộc
  let fallbackData = [...ethnicGroups]
  if (region && ["bac", "trung", "nam"].includes(region)) {
    fallbackData = fallbackData.filter((e) => regionsForEthnic(e).includes(region as RegionId))
  }
  if (q) {
    const query = q.toLowerCase()
    fallbackData = fallbackData.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        (e.altNames && e.altNames.toLowerCase().includes(query)) ||
        e.blurb.toLowerCase().includes(query)
    )
  }

  return NextResponse.json({
    success: true,
    count: fallbackData.length,
    data: fallbackData,
  })
}

