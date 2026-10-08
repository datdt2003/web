import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import path from "path"

export const dynamic = "force-dynamic"

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file tải lên." },
        { status: 400 }
      )
    }

    const mongoose = await connectDB()
    const db = mongoose.connection.db
    if (!db) {
      return NextResponse.json(
        { success: false, message: "Không thể kết nối cơ sở dữ liệu." },
        { status: 500 }
      )
    }

    const originalName = file.name || "upload.jpg"
    const ext = path.extname(originalName).toLowerCase() || ".jpg"
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    const filename = `file-${uniqueSuffix}${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const contentType = file.type || "image/jpeg"

    // Lưu file trực tiếp vào MongoDB Atlas collection 'uploads'
    const uploadsCol = db.collection("uploads")
    await uploadsCol.updateOne(
      { filename },
      {
        $set: {
          filename,
          originalName,
          contentType,
          size: buffer.length,
          data: buffer,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    )

    // Trả về đường dẫn relative để hoạt động chuẩn trên mọi thiết bị và domain
    const relativeUrl = `/api/upload/${filename}`

    return NextResponse.json(
      {
        success: true,
        message: "Tải file lên thành công",
        url: relativeUrl,
        filename,
        originalName,
        contentType,
        size: buffer.length,
      },
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      }
    )
  } catch (error: any) {
    console.error("Lỗi khi upload file lên Next.js API:", error)
    return NextResponse.json(
      { success: false, message: error?.message || "Lỗi xử lý tải file lên máy chủ." },
      { status: 500 }
    )
  }
}

