import jwt from "jsonwebtoken"
import { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "sac_viet_super_secret_jwt_key_2026_ethnic_groups"

export interface TokenPayload {
  userId: string
  name: string
  email: string
  role: "user" | "admin"
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export function getUserFromRequest(request: NextRequest): TokenPayload | null {
  // 1. Try reading from cookie
  const cookieToken = request.cookies.get("auth_token")?.value
  if (cookieToken) {
    const user = verifyToken(cookieToken)
    if (user) return user
  }

  // 2. Try reading from Authorization Header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const headerToken = authHeader.substring(7)
    return verifyToken(headerToken)
  }

  return null
}

