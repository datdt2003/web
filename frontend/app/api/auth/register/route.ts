import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/models/User"
import { signToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu." },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Mật khẩu phải có ít nhất 6 ký tự." },
        { status: 400 }
      )
    }

    await connectDB()

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() })
    if (existingUser) {
      return NextResponse.json(
        { error: "Email này đã được đăng ký tài khoản." },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "user",
    })

    const token = signToken({
      userId: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
    })

    const response = NextResponse.json(
      {
        success: true,
        message: "Đăng ký tài khoản thành công!",
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        },
      },
      { status: 201 }
    )

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
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Đã xảy ra lỗi máy chủ trong quá trình đăng ký." },
      { status: 500 }
    )
  }
}

