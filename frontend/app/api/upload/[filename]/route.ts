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

function getMimeType(filename: string, fallback: string = "image/jpeg") {
  const ext = path.extname(filename).toLowerCase()
  if (ext === ".mp4") return "video/mp4"
  if (ext === ".webm") return "video/webm"
  if (ext === ".ogg") return "video/ogg"
  if (ext === ".mov") return "video/quicktime"
  if (ext === ".png") return "image/png"
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg"
  if (ext === ".webp") return "image/webp"
  if (ext === ".gif") return "image/gif"
  if (ext === ".svg") return "image/svg+xml"
  return fallback
}

function createMediaResponse(buffer: Buffer, rawContentType: string, request: NextRequest, filename: string) {
  const contentType = rawContentType && rawContentType !== "application/octet-stream"
    ? rawContentType
    : getMimeType(filename, rawContentType)
  const range = request.headers.get("range")
  const totalLength = buffer.length

  if (range && contentType.startsWith("video/")) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1] ? parseInt(parts[1], 10) : totalLength - 1

    if (start >= totalLength || end >= totalLength || start > end) {
      return new NextResponse(null, {
        status: 416,
        headers: {
          "Content-Range": `bytes */${totalLength}`,
        },
      })
    }

    const chunk = buffer.subarray(start, end + 1)
    return new NextResponse(chunk, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${totalLength}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunk.length.toString(),
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      },
    })
  }

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Length": totalLength.toString(),
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
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
          const contentType = fileDoc.contentType || getMimeType(filename)
          return createMediaResponse(buffer, contentType, request, filename)
        }

        // Nếu không có trong 'uploads', tìm trong GridFS 'uploads_fs' (dành cho file > 15MB)
        const bucket = new mongoose.mongo.GridFSBucket(db, { bucketName: "uploads_fs" })
        const fsFiles = await bucket.find({ filename }).toArray()
        if (fsFiles.length > 0) {
          const fsFile = fsFiles[0]
          const downloadStream = bucket.openDownloadStreamByName(filename)
          const chunks: Buffer[] = []
          for await (const chunk of downloadStream) {
            chunks.push(chunk as Buffer)
          }
          const buffer = Buffer.concat(chunks)
          const contentType = (fsFile as any).contentType || (fsFile.metadata as any)?.contentType || getMimeType(filename)
          return createMediaResponse(buffer, contentType, request, filename)
        }
      }
    } catch (dbErr) {
      console.warn("Lỗi khi tìm file từ MongoDB Atlas:", dbErr)
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
        const contentType = getMimeType(filename)
        return createMediaResponse(buffer, contentType, request, filename)
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
