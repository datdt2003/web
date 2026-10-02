import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { publishRealtimeEvent } from "@/lib/realtime"

/**
 * API Giả lập thanh toán dành cho môi trường Localhost (chưa Deploy webhook)
 * Cho phép người dùng test nhanh quy trình khi chuyển khoản thành công
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { orderId, paymentCode } = body

    if (!orderId && !paymentCode) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp orderId hoặc paymentCode" },
        { status: 400 }
      )
    }

    await connectDB()

    let order = null
    if (orderId) {
      order = await Order.findById(orderId)
    }
    if (!order && paymentCode) {
      order = await Order.findOne({ paymentCode: paymentCode.toUpperCase() })
    }

    if (!order) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy đơn hàng để giả lập thanh toán" },
        { status: 404 }
      )
    }

    const transactionId = `SIM_PAY_${Date.now()}`

    // Cập nhật trạng thái đơn hàng thành đã thanh toán và hoàn tất
    order.status = "completed"
    order.paymentStatus = "paid"
    order.paidAt = new Date()
    order.paymentTransactionId = transactionId
    await order.save()

    // Bắn sự kiện realtime để màn hình khách hàng và admin tự động cập nhật
    publishRealtimeEvent({
      type: "order.updated",
      data: {
        orderId: order._id.toString(),
        status: "completed",
        paymentStatus: "paid",
        paymentTransactionId: transactionId,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Giả lập thanh toán thành công! Đơn hàng đã được xác nhận thanh toán.",
      data: {
        orderId: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total,
        paymentCode: order.paymentCode,
      },
    })
  } catch (error: any) {
    console.error("Lỗi khi giả lập thanh toán:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Lỗi máy chủ khi giả lập thanh toán" },
      { status: 500 }
    )
  }
}
