import { NextRequest, NextResponse } from "next/server"
import { randomInt } from "node:crypto"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { sendPasswordResetCode } from "@/lib/email"
import { PasswordResetCode } from "@/models/PasswordResetCode"
import { User } from "@/models/User"

export async function POST(request: NextRequest) {
  const genericResponse = {
    success: true,
    message: "Nếu email tồn tại, mã xác nhận đã được gửi.",
  }

  try {
    const body = await request.json()
    const email = String(body.email || "").toLowerCase().trim()
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Vui lòng nhập email hợp lệ." }, { status: 400 })
    }

    await connectDB()
    const user = await User.findOne({ email }).select("email")
    if (!user) return NextResponse.json(genericResponse)

    const code = randomInt(100000, 1000000).toString()
    await PasswordResetCode.deleteMany({ email })
    await PasswordResetCode.create({
      email,
      codeHash: await bcrypt.hash(code, 10),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    })
    await sendPasswordResetCode(email, code)

    return NextResponse.json(genericResponse)
  } catch (error) {
    console.error("Forgot password error:", error)
    if (error instanceof Error && error.message === "SMTP chưa được cấu hình") {
      return NextResponse.json(
        { error: "Máy chủ chưa cấu hình SMTP để gửi email. Vui lòng thêm SMTP_HOST, SMTP_USER và SMTP_PASS vào .env.local." },
        { status: 503 }
      )
    }
    if (error && typeof error === "object" && "code" in error && error.code === "EAUTH") {
      return NextResponse.json(
        { error: "Gmail từ chối đăng nhập SMTP. Hãy dùng App Password Gmail 16 ký tự, không dùng mật khẩu Gmail thường." },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: "Không thể gửi mã xác nhận lúc này. Vui lòng thử lại sau." },
      { status: 500 }
    )
  }
}