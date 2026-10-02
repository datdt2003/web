export const SEPAY_CONFIG = {
  BANK: process.env.NEXT_PUBLIC_SEPAY_BANK || "TPBank", // TPBank, MBBank, VCB, ACB, etc.
  ACC: process.env.NEXT_PUBLIC_SEPAY_ACC || "00000118049",
  NAME: process.env.NEXT_PUBLIC_SEPAY_NAME || "NGUYEN HONG DANG",
  // Mã tiền tố nội dung chuyển khoản để nhận diện webhook / SePay
  PREFIX: process.env.NEXT_PUBLIC_SEPAY_PREFIX || "SV",
}


export function getPaymentCode(orderId: string): string {
  // Trích 6-8 ký tự cuối cùng của ObjectId để nội dung chuyển khoản ngắn gọn, dễ quét: SV + last 8 hex
  const shortId = orderId ? orderId.slice(-8).toUpperCase() : Date.now().toString().slice(-8)
  return `${SEPAY_CONFIG.PREFIX}${shortId}`
}

export function generateSepayQrUrl(options: {
  amount: number
  description: string
  bank?: string
  acc?: string
}): string {
  const bank = encodeURIComponent(options.bank || SEPAY_CONFIG.BANK)
  const acc = encodeURIComponent(options.acc || SEPAY_CONFIG.ACC)
  const amount = Math.round(options.amount)
  const des = encodeURIComponent(options.description)

  // Link sinh QR chuẩn của SePay VietQR template compact
  return `https://qr.sepay.vn/img?bank=${bank}&acc=${acc}&template=compact&amount=${amount}&des=${des}`
}
