import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { PasswordResetCode } from "@/models/PasswordResetCode"
import { User } from "@/models/User"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || "").toLowerCase().trim()
    const code = String(body.code || "").trim()
    const newPassword = String(body.newPassword || "")

    if (!email || !/^\d{6}$/.test(code) || newPassword.length < 6) {
      return NextResponse.json(
        { error: "Email, mã xác nhận hoặc mật khẩu mới không hợp lệ." },
        { status: 400 }
      )
    }

    await connectDB()
    const resetRequest = await PasswordResetCode.findOne({
      email,
      usedAt: { $exists: false },
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: -1 })

    if (!resetRequest || resetRequest.attempts >= 5) {
      return NextResponse.json(
        { error: "Mã xác nhận không hợp lệ hoặc đã hết hạn." },
        { status: 400 }
      )
    }

    const validCode = await bcrypt.compare(code, resetRequest.codeHash)
    if (!validCode) {
      resetRequest.attempts += 1
      await resetRequest.save()
      return NextResponse.json(
        { error: "Mã xác nhận không chính xác." },
        { status: 400 }
      )
    }

    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json({ error: "Không tìm thấy tài khoản." }, { status: 404 })
    }

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    resetRequest.usedAt = new Date()
    await resetRequest.save()

    return NextResponse.json({
      success: true,
      message: "Đổi mật khẩu thành công. Bạn có thể đăng nhập ngay.",
    })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Không thể đổi mật khẩu lúc này." },
      { status: 500 }
    )
  }
}