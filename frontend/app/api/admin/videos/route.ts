import { NextRequest, NextResponse } from "next/server"
import { mkdir, unlink, writeFile } from "node:fs/promises"
import path from "node:path"
import { randomUUID } from "node:crypto"
import { getUserFromRequest } from "@/lib/auth"

export const runtime = "nodejs"

function isAdmin(request: NextRequest) {
  return getUserFromRequest(request)?.role === "admin"
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("video")
    if (!(file instanceof File) || !file.type.startsWith("video/")) {
      return NextResponse.json({ error: "Vui lòng chọn một file video hợp lệ." }, { status: 400 })
    }
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Video không được vượt quá 100MB." }, { status: 400 })
    }

    const extension = path.extname(file.name).toLowerCase() || ".mp4"
    const fileName = `${randomUUID()}${extension}`
    const directory = path.join(process.cwd(), "public", "videos")
    await mkdir(directory, { recursive: true })
    await writeFile(path.join(directory, fileName), Buffer.from(await file.arrayBuffer()))

    return NextResponse.json({ success: true, url: `/videos/${fileName}` }, { status: 201 })
  } catch (error) {
    console.error("Upload video error:", error)
    return NextResponse.json({ error: "Không thể tải video lên." }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdmin(request)) {
    return NextResponse.json({ error: "Bạn không có quyền thực hiện thao tác này." }, { status: 403 })
  }

  try {
    const { url } = await request.json()
    if (typeof url !== "string" || !url.startsWith("/videos/")) {
      return NextResponse.json({ error: "Đường dẫn video không hợp lệ." }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public", url)
    await unlink(filePath)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete video error:", error)
    return NextResponse.json({ error: "Không thể xóa video." }, { status: 500 })
  }
}