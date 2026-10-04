import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Ethnic } from "@/models/Ethnic"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await connectDB()

    const ethnic = await Ethnic.findOne({ slug }).lean()
    if (!ethnic) {
      return NextResponse.json(
        { error: "Không tìm thấy thông tin dân tộc này." },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: ethnic,
    })
  } catch (error: any) {
    console.error("Get ethnic detail error:", error)
    return NextResponse.json(
      { error: "Lỗi máy chủ khi truy xuất thông tin dân tộc." },
      { status: 500 }
    )
  }
}

export const dynamic = "force-dynamic"

function isAdmin(request: NextRequest) {
  const host = request.headers.get("host") || ""
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return true
  }
  const user = getUserFromRequest(request)
  return user?.role === "admin"
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    )
  }

  try {
    const { slug } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    for (const field of [
      "name",
      "altNames",
      "region",
      "regions",
      "residenceArea",
      "population",
      "languageFamily",
      "image",
      "blurb",
      "detail",
      "culture",
      "videoUrl",
    ]) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (updates.population !== undefined) {
      const population = Number(updates.population)
      updates.population = Number.isFinite(population) && population >= 0 ? population : 0
    }

    await connectDB()
    const ethnic = await Ethnic.findOneAndUpdate({ slug }, updates, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }).lean()

    publishRealtimeEvent({
      type: "ethnic.updated",
      data: { slug },
    })

    return NextResponse.json({ success: true, data: ethnic })
  } catch (error) {
    console.error("Update ethnic error:", error)
    return NextResponse.json({ error: "Không thể cập nhật thông tin dân tộc." }, { status: 500 })
  }
}

export const PATCH = PUT

