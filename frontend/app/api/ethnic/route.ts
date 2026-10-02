import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const region = searchParams.get("region")
    const q = searchParams.get("q")?.trim()

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

    return NextResponse.json({
      success: true,
      count: ethnics.length,
      data: ethnics,
    })
  } catch (error: any) {
    console.error("Get ethnics error:", error)
    return NextResponse.json(
      { error: "Không thể tải danh sách dân tộc từ cơ sở dữ liệu." },
      { status: 500 }
    )
  }
}

