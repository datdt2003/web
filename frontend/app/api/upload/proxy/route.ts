import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetUrl = searchParams.get("url")

    if (!targetUrl) {
      return new NextResponse("Thiếu tham số url", { status: 400 })
    }

    // Nếu là URL local hoặc relative
    let fetchUrl = targetUrl
    if (targetUrl.startsWith("/")) {
      const host = request.headers.get("host") || "localhost:3000"
      const protocol = request.headers.get("x-forwarded-proto") || "http"
      fetchUrl = `${protocol}://${host}${targetUrl}`
    }

    const res = await fetch(fetchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    })

    if (!res.ok) {
      return new NextResponse(`Không thể tải ảnh nguồn: ${res.statusText}`, {
        status: res.status,
      })
    }

    const contentType = res.headers.get("content-type") || "image/jpeg"
    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch (err: any) {
    console.error("Lỗi Image Proxy:", err)
    return new NextResponse(err?.message || "Lỗi khi proxy ảnh", { status: 500 })
  }
}
