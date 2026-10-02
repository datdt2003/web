import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import { Order } from "@/models/Order"
import { getUserFromRequest } from "@/lib/auth"
import { publishRealtimeEvent } from "@/lib/realtime"

import mongoose from "mongoose"
import { getPaymentCode } from "@/lib/sepay"

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: "Vui lòng đăng nhập để xem đơn hàng." },
        { status: 401 }
      )
    }

    await connectDB()

    // If admin, return all orders; if user, return only their orders
    const query = user.role === "admin" ? {} : { email: user.email }
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      count: orders.length,
      data: orders,
    })
  } catch (error: any) {
    console.error("Get orders error:", error)
    return NextResponse.json(
      { error: "Không thể lấy thông tin đơn hàng." },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    const body = await request.json()
    const { customerName, email, phone, city, address, items, notes } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Giỏ hàng trống, không thể tạo đơn hàng." },
        { status: 400 }
      )
    }

    const orderCustomerName = (customerName || (user ? user.name : "")).trim()
    const orderEmail = (email || (user ? user.email : "")).trim()
    const orderPhone = String(phone || "").trim()
    const orderCity = String(city || "").trim()
    const orderAddress = String(address || "").trim()

    if (!orderCustomerName || !orderEmail || !orderPhone || !orderCity || !orderAddress) {
      return NextResponse.json(
        { error: "Vui lòng nhập đầy đủ thông tin: Họ tên, Email, Số điện thoại, Thành phố và Địa chỉ nhận hàng." },
        { status: 400 }
      )
    }

    const subtotal = items.reduce(
      (acc: number, item: any) => acc + (item.price || 0) * (item.qty || 1),
      0
    )
    const shippingFee = subtotal > 0 ? 30000 : 0
    const total = subtotal + shippingFee

    await connectDB()

    const orderObjectId = new mongoose.Types.ObjectId()
    const paymentCode = getPaymentCode(orderObjectId.toString())

    const newOrder = await Order.create({
      _id: orderObjectId,
      userId: user?.userId || undefined,
      customerName: orderCustomerName,
      email: orderEmail,
      phone: orderPhone,
      address: orderCity ? `${orderAddress}, ${orderCity}` : orderAddress,
      items: items.map((i: any) => ({
        productId: i.id || i.productId,
        name: i.name,
        price: i.price,
        qty: i.qty || 1,
        image: i.image,
        category: i.category,
      })),
      subtotal,
      shippingFee,
      total,
      status: "pending",
      paymentStatus: "unpaid",
      paymentCode,
      notes: notes || "",
    })

    publishRealtimeEvent({
      type: "order.created",
      data: {
        orderId: newOrder._id.toString(),
        paymentCode: newOrder.paymentCode,
        email: newOrder.email,
        total: newOrder.total,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: "Tạo đơn hàng thành công!",
        orderId: newOrder._id.toString(),
        paymentCode: newOrder.paymentCode,
        total: newOrder.total,
        data: newOrder,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Create order error:", error)
    return NextResponse.json(
      { error: "Không thể tạo đơn hàng lúc này." },
      { status: 500 }
    )
  }
}


