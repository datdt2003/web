import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { Order } from "@/models/Order"
import { getUserFromRequest } from "@/lib/auth"
import { signToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ user: null })
    }

    await connectDB()
    const user = await User.findById(payload.userId).select("-password")
    if (!user) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        savedEthnics: user.savedEthnics || [],
      },
    })
  } catch (error: any) {
    console.error("Auth me error:", error)
    return NextResponse.json({ user: null })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const payload = getUserFromRequest(request)
    if (!payload) {
      return NextResponse.json({ error: "Vui lòng đăng nhập." }, { status: 401 })
    }

    const body = await request.json()
    const name = String(body.name || "").trim()
    const email = String(body.email || "").toLowerCase().trim()
    const currentPassword = String(body.currentPassword || "")
    const newPassword = String(body.newPassword || "")

    if (!name || name.length < 2 || !email.includes("@")) {
      return NextResponse.json(
        { error: "Họ tên hoặc email không hợp lệ." },
        { status: 400 }
      )
    }

    if (newPassword && newPassword.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu mới phải có ít nhất 6 ký tự." },
        { status: 400 }
      )
    }

    await connectDB()
    const account = await User.findById(payload.userId)
    if (!account) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 })
    }

    if (newPassword) {
      if (!currentPassword || !(await bcrypt.compare(currentPassword, account.password))) {
        return NextResponse.json({ error: "Mật khẩu hiện tại không chính xác." }, { status: 400 })
      }
      account.password = await bcrypt.hash(newPassword, 10)
      await account.save()
    }

    const duplicate = await User.findOne({ email, _id: { $ne: payload.userId } }).select("_id")
    if (duplicate) {
      return NextResponse.json({ error: "Email này đã được sử dụng." }, { status: 400 })
    }

    const user = await User.findByIdAndUpdate(
      payload.userId,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password")

    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 })
    }

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })
    const response = NextResponse.json({
      success: true,
      message: "Đã cập nhật thông tin cá nhân.",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        savedEthnics: user.savedEthnics || [],
      },
    })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json(
      { error: "Không thể cập nhật thông tin cá nhân." },
      { status: 500 }
    )
  }
}

