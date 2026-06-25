// @ts-nocheck
import { Outfit, Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/context/cart-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { SidebarProvider } from "@/components/ui/sidebar"
import { ToastProvider } from "@/components/ui/use-toast"
import LayoutWrapper from "@/components/layout-wrapper"
import BackToTop from "@/components/back-to-top"

const outfit = Outfit({ subsets: ["latin"], variable: "--font-sans" })
const inter = Inter({ subsets: ["latin"], variable: "--font-mono" })

export const metadata = {
  title: "Luxe Nest | Premium Household Goods",
  description: "Discover premium household items to elevate your living space.",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <body className={`${outfit.className} font-sans antialiased text-slate-800 bg-[#FAFAF9]`}>
        <CartProvider>
          <WishlistProvider>
            <ToastProvider>
              <SidebarProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
                <BackToTop />
                <Toaster />
              </SidebarProvider>
            </ToastProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  )
}
