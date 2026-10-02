import { NextRequest, NextResponse } from "next/server"
import { publishRealtimeEvent } from "@/lib/realtime"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Đảm bảo request này chỉ gọi từ nội bộ (tuỳ chọn: có thể thêm secret key)
    
    publishRealtimeEvent({
      type: body.type,
      data: body.data,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Lỗi phát sự kiện" }, { status: 500 })
  }
}

