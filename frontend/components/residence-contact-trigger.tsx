"use client"

import { MessageCircle, Phone } from "lucide-react"

export function ResidenceContactTrigger() {
  const handleClick = () => {
    window.dispatchEvent(new CustomEvent("open-contact-bubble"))
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title="Bấm vào bong bóng để xem thông tin liên hệ Facebook & số điện thoại"
      className="group inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-semibold text-primary transition-all hover:border-primary hover:bg-primary hover:text-white"
    >
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75 group-hover:bg-white" />
        <span className="relative inline-flex size-2 rounded-full bg-primary group-hover:bg-white" />
      </span>
      <MessageCircle className="size-3" />
      <span>Liên hệ: 0369170660</span>
    </button>
  )
}
