// @ts-nocheck
"use client"

import { usePathname } from "next/navigation"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import WhatsAppButton from "@/components/whatsapp-button"

export default function LayoutWrapper({ children }) {
  const pathname = usePathname()
  const isAdminPath = pathname?.startsWith("/admin")

  if (isAdminPath) {
    return <main className="flex-1 w-full">{children}</main>
  }

  return (
    <div className="flex min-h-screen flex-col w-full">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}
