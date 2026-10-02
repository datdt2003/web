import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

type OrderRouteContext = { params: Promise<{ id: string }> }
const orderStatuses = ["pending", "processing", "confirmed", "shipping", "completed", "cancelled"] as const

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: OrderRouteContext
) {
  try {
    const { id } = await params
    await connectDB()
    const order = await Order.findById(id).lean()
    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      )
    }

    // Nếu có token user kiểm tra bảo mật thông thường
    const user = getUserFromRequest(request)
    if (user && user.role !== "admin" && order.email !== user.email) {
      return NextResponse.json(
        { error: "Bạn không có quyền xem đơn hàng này." },
        { status: 403 }
      )
    }

    // Nếu đơn hàng chưa thanh toán và có cấu hình SEPAY_API_KEY, chủ động kiểm tra với SePay API
    const sepayApiKey = process.env.SEPAY_API_KEY
    let currentStatus = order.status
    let currentPaymentStatus = order.paymentStatus || "unpaid"

    if (
      currentStatus !== "completed" &&
      currentPaymentStatus !== "paid" &&
      sepayApiKey &&
      order.paymentCode
    ) {
      try {
        const sepayRes = await fetch(
          `https://my.sepay.vn/userapi/transactions/list?limit=50`,
          {
            headers: {
              Authorization: `Bearer ${sepayApiKey}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        )

        if (sepayRes.ok) {
          const sepayData = await sepayRes.json()
          const transactions = sepayData.transactions || sepayData.data || []
          const codeUpper = order.paymentCode.toUpperCase()
          const shortIdUpper = id.slice(-8).toUpperCase()

          const matchTx = transactions.find((tx: any) => {
            const content = String(
              tx.transaction_content || tx.description || tx.content || ""
            ).toUpperCase()
            const amountIn = Number(tx.amount_in || tx.transferAmount || tx.amount || 0)
            const isCodeMatched = content.includes(codeUpper) || content.includes(shortIdUpper)
            const isAmountMatched = amountIn >= order.total || amountIn >= 1000
            return isCodeMatched && isAmountMatched
          })

          if (matchTx) {
            console.log(`[SePay Sync] => TÌM THẤY GIAO DỊCH KHỚP: ID=${matchTx.id}, Tiền=${matchTx.amount_in || matchTx.transferAmount}`)
            await Order.findByIdAndUpdate(id, {
              status: "completed",
              paymentStatus: "paid",
              paidAt: new Date(),
              paymentTransactionId: String(matchTx.id || matchTx.reference_number || Date.now()),
            })

            publishRealtimeEvent({
              type: "order.updated",
              data: {
                orderId: id,
                status: "completed",
                paymentStatus: "paid",
              },
            })

            currentStatus = "completed"
            currentPaymentStatus = "paid"
          }
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra SePay API:", err)
      }
    }

    // Trả về thông tin đơn hàng (phục vụ cả kiểm tra trạng thái thanh toán)
    return NextResponse.json({
      success: true,
      data: {
        _id: order._id,
        customerName: order.customerName,
        email: order.email,
        total: order.total,
        status: currentStatus,
        paymentStatus: currentPaymentStatus,
        paymentCode: order.paymentCode,
        createdAt: order.createdAt,
      },
    })
  } catch (error) {
    console.error("Get order detail error:", error)
    return NextResponse.json(
      { error: "Không thể lấy thông tin đơn hàng." },
      { status: 500 }
    )
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: OrderRouteContext
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
    if (!orderStatuses.includes(body.status)) {
      return NextResponse.json(
        { error: "Trạng thái đơn hàng không hợp lệ." },
        { status: 400 }
      )
    }

    await connectDB()
    const order = await Order.findByIdAndUpdate(
      id,
      { status: body.status },
      { new: true, runValidators: true }
    ).lean()

    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      )
    }

    publishRealtimeEvent({
      type: "order.updated",
      data: { orderId: order._id.toString(), status: order.status },
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

export async function DELETE(
  request: NextRequest,
  { params }: OrderRouteContext
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
    await connectDB()
    const order = await Order.findById(id)
    if (!order) {
      return NextResponse.json(
        { error: "Không tìm thấy đơn hàng." },
        { status: 404 }
      )
    }

    if (order.status !== "cancelled") {
      return NextResponse.json(
        { error: "Chỉ có thể xóa các đơn hàng đã bị hủy." },
        { status: 400 }
      )
    }

    await Order.findByIdAndDelete(id)

    publishRealtimeEvent({
      type: "order.deleted",
      data: { orderId: id },
    })

    return NextResponse.json({
      success: true,
      message: "Đã xóa đơn hàng thành công.",
    })
  } catch (error) {
    console.error("Delete order error:", error)
    return NextResponse.json(
      { error: "Không thể xóa đơn hàng." },
      { status: 500 }
    )
  }
}