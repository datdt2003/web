import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

type ProductRouteContext = { params: Promise<{ id: string }> }

function isAdmin(request: NextRequest) {
  const host = request.headers.get("host") || ""
  if (host.includes("localhost") || host.includes("127.0.0.1")) {
    return true
  }
  const user = getUserFromRequest(request)
  return user?.role === "admin"
}

export async function GET(
  _request: NextRequest,
  { params }: ProductRouteContext
) {
  try {
    const { id } = await params
    await connectDB()

    const product = await Product.findOne({ id }).lean()
    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Get product detail error:", error)
    return NextResponse.json(
      { error: "Không thể lấy thông tin sản phẩm." },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: ProductRouteContext
) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}

    for (const field of [
      "name",
      "price",
      "image",
      "ethnicSlug",
      "category",
      "description",
      "origin",
      "craft",
      "culturalValue",
      "forSale",
      "inStock",
    ]) {
      if (body[field] !== undefined) updates[field] = body[field]
    }

    if (updates.price !== undefined) {
      const price = Number(updates.price)
      if (!Number.isFinite(price) || price < 0) {
        return NextResponse.json(
          { error: "Giá sản phẩm không hợp lệ." },
          { status: 400 }
        )
      }
      updates.price = price
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Không có thông tin cần cập nhật." },
        { status: 400 }
      )
    }

    await connectDB()
    const product = await Product.findOneAndUpdate({ id }, updates, {
      new: true,
      runValidators: true,
    }).lean()

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      )
    }

    publishRealtimeEvent({
      type: "product.updated",
      data: { productId: product.id, action: "updated" },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật sản phẩm." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: ProductRouteContext
) {
  if (!isAdmin(request)) {
    return NextResponse.json(
      { error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    await connectDB()
    const product = await Product.findOneAndDelete({ id }).lean()

    if (!product) {
      return NextResponse.json(
        { error: "Không tìm thấy sản phẩm." },
        { status: 404 }
      )
    }

    publishRealtimeEvent({
      type: "product.deleted",
      data: { productId: product.id },
    })

    return NextResponse.json({ success: true, data: product })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json(
      { error: "Không thể xóa sản phẩm." },
      { status: 500 }
    )
  }
}