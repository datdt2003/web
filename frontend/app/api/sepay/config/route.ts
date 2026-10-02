import { NextResponse } from "next/server"
import { SEPAY_CONFIG } from "@/lib/sepay"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({
    bank: process.env.NEXT_PUBLIC_SEPAY_BANK || SEPAY_CONFIG.BANK || "TPBank",
    acc: process.env.NEXT_PUBLIC_SEPAY_ACC || SEPAY_CONFIG.ACC || "00000118049",
    name: process.env.NEXT_PUBLIC_SEPAY_NAME || SEPAY_CONFIG.NAME || "NGUYEN HONG DANG",
    prefix: process.env.NEXT_PUBLIC_SEPAY_PREFIX || SEPAY_CONFIG.PREFIX || "SV",
  })
}
