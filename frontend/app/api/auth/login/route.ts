import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Vui lòng nhập email và mật khẩu." },
        { status: 400 }
      )
    }

    await connectDB()

    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "Email hoặc mật khẩu không chính xác." },
        { status: 401 }
      )
    }

    const token = signToken({
      userId: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    })

    const response = NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })

    // Set HTTP-only Cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình đăng nhập." },
      { status: 500 }
    )
  }
}

