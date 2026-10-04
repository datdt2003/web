import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

type RouteContext = {
  params: Promise<{ filename: string }>
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    },
  })
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { filename } = await params

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 })
    }

    // 1. Tìm file trong MongoDB Atlas collection 'uploads'
    try {
      const mongoose = await connectDB()
      const db = mongoose.connection.db
      if (db) {
        const fileDoc = await db.collection("uploads").findOne({ filename })
        if (fileDoc && fileDoc.data) {
          const buffer = fileDoc.data.buffer
            ? Buffer.from(fileDoc.data.buffer)
            : Buffer.from(fileDoc.data)
          const contentType = fileDoc.contentType || "image/jpeg"

          return new NextResponse(buffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Content-Length": buffer.length.toString(),
              "Cache-Control": "public, max-age=31536000, immutable",
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
            },
          })
        }
      }
    } catch (dbErr) {
      console.warn("Lỗi khi tìm ảnh từ MongoDB Atlas:", dbErr)
    }

    // 2. Fallback: Tìm file trong thư mục local backend/uploads hoặc public
    const localCandidates = [
      path.join(process.cwd(), "..", "backend", "uploads", filename),
      path.join(process.cwd(), "uploads", filename),
      path.join(process.cwd(), "public", "uploads", filename),
    ]

    for (const candidate of localCandidates) {
      if (fs.existsSync(candidate)) {
        const buffer = fs.readFileSync(candidate)
        const ext = path.extname(filename).toLowerCase()
        let contentType = "image/jpeg"
        if (ext === ".png") contentType = "image/png"
        else if (ext === ".webp") contentType = "image/webp"
        else if (ext === ".gif") contentType = "image/gif"
        else if (ext === ".svg") contentType = "image/svg+xml"
        else if (ext === ".mp4") contentType = "video/mp4"

        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          },
        })
      }
    }

    // 3. Fallback an toàn nếu file cũ bị mất: Trả về ảnh mặc định thay vì trả về 404 gây vỡ ảnh
    const fallbackCandidates = [
      path.join(process.cwd(), "public", "images", "ethnic-kinh.png"),
      path.join(process.cwd(), "public", "placeholder.svg"),
    ]

    for (const fb of fallbackCandidates) {
      if (fs.existsSync(fb)) {
        const buffer = fs.readFileSync(fb)
        const isSvg = fb.endsWith(".svg")
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": isSvg ? "image/svg+xml" : "image/png",
            "Content-Length": buffer.length.toString(),
            "Cache-Control": "public, max-age=60",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
          },
        })
      }
    }

    return new NextResponse("File không tồn tại", { status: 404 })
  } catch (error: any) {
    console.error("Lỗi khi phục vụ file upload:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
