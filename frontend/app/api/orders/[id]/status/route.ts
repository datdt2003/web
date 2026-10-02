import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

type RouteContext = { params: Promise<{ id: string }> }
const validStatuses = ["pending", "processing", "confirmed", "shipping", "completed", "cancelled"] as const

export async function PATCH(
  request: NextRequest,
  { params }: RouteContext
) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== "admin") {
    return NextResponse.json(
      { error: "Bạn không có quyền thực hiện thao tác này." },
      { status: 403 }
    )
  }

  try {
    const { id } = await params
    const body = await request.json()
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Trạng thái đơn hàng không hợp lệ." },
        { status: 400 }
      )
    }

    await connectDB()
    const updateData: any = { status: body.status }
    if (body.status === "completed") {
      updateData.paymentStatus = "paid"
      updateData.paidAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).lean()

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      )
    }

    publishRealtimeEvent({
      type: "order.updated",
      data: {
        orderId: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    })

    return NextResponse.json({ success: true, data: order })
  } catch (error) {
    console.error("Update order status error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật trạng thái đơn hàng." },
      { status: 500 }
    )
  }
}
