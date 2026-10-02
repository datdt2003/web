import nodemailer from "nodemailer"

function getTransporter() {
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error("SMTP chưa được cấu hình")
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: { user, pass },
  })
}

export async function sendPasswordResetCode(email: string, code: string) {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  if (!from) throw new Error("SMTP_FROM chưa được cấu hình")

  await getTransporter().sendMail({
    from,
    to: email,
    subject: "Mã đặt lại mật khẩu Hồn Y Đất Việt",
    text: `Mã đặt lại mật khẩu của bạn là ${code}. Mã có hiệu lực trong 10 phút.`,
    html: `<p>Mã đặt lại mật khẩu của bạn là:</p><p style="font-size: 28px; font-weight: bold; letter-spacing: 6px">${code}</p><p>Mã có hiệu lực trong 10 phút.</p>`,
  })
}