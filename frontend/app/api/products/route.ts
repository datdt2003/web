import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Product } from "@/models/Product"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const ethnicSlug = searchParams.get("ethnicSlug")
    const category = searchParams.get("category")

    const filter: Record<string, any> = {}
    if (ethnicSlug) filter.ethnicSlug = ethnicSlug
    if (category) filter.category = category

    const products = await Product.find(filter).lean()

    return NextResponse.json({
      success: true,
      count: products.length,
      data: products,
    })
  } catch (error: any) {
    console.error("Get products error:", error)
    return NextResponse.json(
      { error: "Không thể lấy danh sách sản phẩm." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = request.headers.get("host") || ""
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1")
    const user = getUserFromRequest(request)

    if (!isLocal && (!user || user.role !== "admin")) {
      return NextResponse.json(
        { error: "Bạn không có quyền thực hiện thao tác này." },
        { status: 403 }
      )
    }

    const body = await request.json()
    let { id, name, price, image, ethnicSlug, category, description, forSale, inStock } = body

    if (!name || price === undefined || price === null || price === "") {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ tên sản phẩm và giá bán." },
        { status: 400 }
      )
    }

    await connectDB()

    if (!id) {
      id = `sp-${Date.now()}`
    }

    // Đảm bảo id là duy nhất, không bị lỗi duplicate key
    let finalId = id
    let counter = 1
    while (await Product.findOne({ id: finalId })) {
      finalId = `${id}-${counter++}`
    }

    const product = await Product.create({
      id: finalId,
      name: String(name).trim(),
      price: Number(price),
      image: image?.trim() || "/placeholder.svg",
      ethnicSlug: ethnicSlug?.trim() || "Chung",
      category: category?.trim() || "Thủ công",
      description: description?.trim() || "",
      forSale: forSale !== undefined ? Boolean(forSale) : true,
      inStock: inStock !== undefined ? Boolean(inStock) : true,
    })

    publishRealtimeEvent({
      type: "product.created",
      data: { productId: product.id, action: "created" },
    })

    return NextResponse.json(
      { success: true, data: product },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Create product error:", error)
    return NextResponse.json(
      { error: error.message || "Lỗi máy chủ khi tạo sản phẩm." },
      { status: 500 }
    )
  }
}

