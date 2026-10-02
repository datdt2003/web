import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { publishRealtimeEvent } from "@/lib/realtime"
import { SEPAY_CONFIG } from "@/lib/sepay"

/**
 * Webhook nhận thông báo giao dịch từ SePay (https://my.sepay.vn)
 * Payload mẫu từ SePay:
 * {
 *   "id": 123456,
 *   "gateway": "MBBank",
 *   "transactionDate": "2024-03-24 15:30:00",
 *   "accountNumber": "0377287903",
 *   "code": null,
 *   "content": "SV685AD123 thanh toan don hang",
 *   "transferType": "in",
 *   "transferAmount": 150000,
 *   "accumulated": 150000,
 *   "subAccount": null,
 *   "referenceCode": "FT24084123456789",
 *   "description": "..."
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Kiểm tra API Key / Secret nếu được cấu hình
    const sepayApiKey = process.env.SEPAY_API_KEY
    if (sepayApiKey) {
      const authHeader = request.headers.get("authorization")
      // SePay có thể gửi header dạng 'Apikey YOUR_API_KEY' hoặc 'Bearer YOUR_API_KEY'
      if (
        !authHeader ||
        (!authHeader.includes(sepayApiKey) && authHeader !== `Apikey ${sepayApiKey}`)
      ) {
        return NextResponse.json(
          { success: false, message: "Unauthorized SePay API key" },
          { status: 401 }
        )
      }
    }

    const body = await request.json()
    console.log("[SePay Webhook Received]:", body)

    // Chỉ xử lý giao dịch tiền vào (transferType = 'in' hoặc transferAmount > 0)
    const transferType = body.transferType || (body.transferAmount > 0 ? "in" : "out")
    if (transferType !== "in") {
      return NextResponse.json({
        success: true,
        message: "Bỏ qua giao dịch không phải tiền vào (transferType != 'in')",
      })
    }

    const transferAmount = Number(body.transferAmount || 0)
    const content = String(body.content || body.description || "")

    if (!content) {
      return NextResponse.json(
        { success: false, message: "Nội dung chuyển khoản rỗng" },
        { status: 400 }
      )
    }

    await connectDB()

    // 2. Trích xuất mã thanh toán dạng SVxxxxxxxx (PREFIX + 8 hex/chữ số)
    const prefix = SEPAY_CONFIG.PREFIX || "SV"
    const regex = new RegExp(`${prefix}[A-Za-z0-9]{4,12}`, "i")
    const match = content.match(regex)

    let order = null

    if (match) {
      const extractedCode = match[0].toUpperCase()
      // Tìm đơn hàng theo paymentCode
      order = await Order.findOne({ paymentCode: extractedCode })
    }

    // Nếu không khớp mã paymentCode, thử tìm kiếm đơn theo ID nằm trong content
    if (!order) {
      // Tìm xem có orderId 24 hex chars trong content không
      const hexMatch = content.match(/[0-9a-fA-F]{24}/)
      if (hexMatch) {
        order = await Order.findById(hexMatch[0])
      }
    }

    if (!order) {
      console.warn(`[SePay Webhook] Không tìm thấy đơn hàng khớp nội dung: "${content}"`)
      return NextResponse.json({
        success: true,
        message: `Đã nhận webhook nhưng không tìm thấy đơn hàng tương ứng với: ${content}`,
      })
    }

    // 3. Kiểm tra số tiền chuyển có đủ không (cho phép sai số nhỏ nếu có làm tròn)
    if (transferAmount < order.total) {
      console.warn(
        `[SePay Webhook] Đơn ${order._id}: Số tiền nhận (${transferAmount}) nhỏ hơn tổng tiền đơn (${order.total})`
      )
      // Cập nhật trạng thái một phần hoặc ghi chú
      await Order.findByIdAndUpdate(order._id, {
        notes: (order.notes ? order.notes + " | " : "") + `Đã nhận ${transferAmount}đ qua SePay (chưa đủ ${order.total}đ)`,
      })

      return NextResponse.json({
        success: true,
        message: "Số tiền chuyển khoản chưa đủ giá trị đơn hàng",
      })
    }

    // 4. Cập nhật đơn hàng thành hoàn thành (completed) & paid
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      {
        status: "completed",
        paymentStatus: "paid",
        paidAt: new Date(),
        paymentTransactionId: String(body.id || body.referenceCode || Date.now()),
      },
      { new: true }
    ).lean()

    // 5. Phát sự kiện realtime SSE để giao diện giỏ hàng và admin tự động cập nhật
    publishRealtimeEvent({
      type: "order.updated",
      data: {
        orderId: order._id.toString(),
        status: "completed",
        paymentStatus: "paid",
        amount: transferAmount,
      },
    })

    console.log(`[SePay Webhook] Đơn hàng ${order._id} đã thanh toán thành công và hoàn thành!`)

    return NextResponse.json({
      success: true,
      message: "Xác nhận thanh toán đơn hàng thành công",
      orderId: order._id.toString(),
    })
  } catch (error: any) {
    console.error("[SePay Webhook Error]:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Lỗi xử lý webhook" },
      { status: 500 }
    )
  }
}
