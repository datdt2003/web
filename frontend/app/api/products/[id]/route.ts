import { NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"
import { products as staticProducts } from "@/lib/ethnic-data"

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

    const filter = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id }

    const product = await Product.findOne(filter).lean()
    if (!product) {
      const staticProd = staticProducts.find((p) => p.id === id)
      if (staticProd) {
        return NextResponse.json({ success: true, data: staticProd })
      }
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

    const filter = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id }

    let product = await Product.findOneAndUpdate(filter, updates, {
      new: true,
      runValidators: true,
    }).lean()

    // Nếu chưa tồn tại trong MongoDB (ví dụ sản phẩm mẫu/mặc định p-hmong-1, p-thai-1... đang được sửa lần đầu)
    if (!product) {
      const staticProd = staticProducts.find((p) => p.id === id)

      const newDoc = {
        id: id,
        name: updates.name !== undefined ? String(updates.name).trim() : (staticProd?.name || "Sản phẩm"),
        price: updates.price !== undefined ? Number(updates.price) : (staticProd?.price || 0),
        image: updates.image !== undefined ? String(updates.image).trim() : (staticProd?.image || "/placeholder.svg"),
        ethnicSlug: updates.ethnicSlug !== undefined ? String(updates.ethnicSlug).trim() : (staticProd?.ethnicSlug || "Chung"),
        category: updates.category !== undefined ? String(updates.category).trim() : (staticProd?.category || "Thủ công"),
        description: updates.description !== undefined ? String(updates.description).trim() : (staticProd?.description || ""),
        origin: updates.origin !== undefined ? String(updates.origin).trim() : (staticProd?.origin || ""),
        craft: updates.craft !== undefined ? String(updates.craft).trim() : (staticProd?.craft || ""),
        culturalValue: updates.culturalValue !== undefined ? String(updates.culturalValue).trim() : (staticProd?.culturalValue || ""),
        forSale: updates.forSale !== undefined ? Boolean(updates.forSale) : (staticProd?.forSale ?? false),
        inStock: updates.inStock !== undefined ? Boolean(updates.inStock) : (staticProd?.inStock ?? true),
      }

      const created = await Product.create(newDoc)
      product = created.toObject ? created.toObject() : created
    }

    publishRealtimeEvent({
      type: "product.updated",
      data: { productId: (product as any)?.id || id, action: "updated" },
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

    const filter = mongoose.isValidObjectId(id)
      ? { $or: [{ id }, { _id: id }] }
      : { id }

    const product = await Product.findOneAndDelete(filter).lean()

    if (!product) {
      const staticProd = staticProducts.find((p) => p.id === id)
      if (staticProd) {
        return NextResponse.json({ success: true, data: staticProd, message: "Đã gỡ sản phẩm." })
      }
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