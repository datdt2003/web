import { AuthForm } from "@/components/auth-form"

export const metadata = {
  title: "Đăng nhập — Sắc Việt",
}

export default function LoginPage() {
  return <AuthForm mode="login" />
}
