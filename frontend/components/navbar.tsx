// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
  Menu,
  ShoppingCart,
  Search,
  X,
  Phone,
  Mail,
  ChevronDown,
  ArrowRight,
  Heart,
  LayoutGrid,
  Store,
  Info,
  MessageCircle,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  const { cartItems } = useCart()
  const { wishlistItems } = useWishlist()
  const [isScrolled, setIsScrolled] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false)
  const [categories, setCategories] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const mobileMenuRef = useRef(null)

  // Fetch categories from DB
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories")
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setCategories(data.categories || [])
      } catch (err) {
        console.error("Navbar: could not load categories", err)
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Listen for scroll events
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    // Set initial scroll state immediately
    setIsScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false)
    // Reset scroll state on navigation to prevent freeze
    setIsScrolled(window.scrollY > 10)
  }, [pathname])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) return
    setIsMobileMenuOpen(false)
    router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`)
  }

  const handleCategoryClick = (categoryName) => {
    setIsCategoriesDropdownOpen(false)
    setIsMobileMenuOpen(false)
    router.push(`/shop?categories=${encodeURIComponent(categoryName)}`)
  }

  const totalCartItems = cartItems.reduce((total, item) => total + (item.quantity || 1), 0)
  const topCategories = categories.slice(0, 5)

  return (
    <div className="w-full relative z-50">
      {/* ============================================================
          TIER 1: Top Utility Bar — Desktop only
         ============================================================ */}
      <div className="hidden sm:block bg-primary text-white px-4 py-2 text-[11px] md:text-xs md:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Left: Contact info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="tel:+254769567516" className="flex items-center gap-1.5 hover:text-white/80 transition-colors duration-150">
              <Phone className="h-3.5 w-3.5 text-white/80" />
              <span className="font-medium">+254 769 567 516</span>
            </a>
            <span className="text-white/30 hidden md:inline">|</span>
            <a href="mailto:sales@luxenest.com" className="hidden md:flex items-center gap-1.5 hover:text-white/80 transition-colors duration-150">
              <Mail className="h-3.5 w-3.5 text-white/80" />
              <span className="font-medium">sales@luxenest.com</span>
            </a>
          </div>
          {/* Right: Quick links */}
          <div className="flex items-center gap-3 sm:gap-5">
            <Link href="/shop" className="hover:text-white/80 transition-colors duration-150 font-medium">Shop</Link>
            <span className="text-white/30">|</span>
            <Link href="/about" className="hover:text-white/80 transition-colors duration-150 font-medium">About</Link>
            <span className="text-white/30">|</span>
            <Link href="/contact" className="hover:text-white/80 transition-colors duration-150 font-medium">Contact</Link>
          </div>
        </div>
      </div>

      {/* ============================================================
          STICKY WRAPPER: always sticky — TIER 2 (Main Header) + TIER 3 (Categories)
         ============================================================ */}
      <div className={`w-full bg-white sticky top-0 transition-all duration-200 ${isScrolled ? "shadow-lg" : "shadow-sm"}`}>

        {/* TIER 2: Main Header */}
        <header className="border-b border-slate-100">
          <div className="mx-auto flex max-w-7xl items-center px-4 md:px-6 lg:px-8 h-20 md:h-24 gap-3 lg:gap-6">

            {/* Mobile hamburger */}
            <button
              className="flex items-center justify-center p-2 -ml-1 rounded-lg text-slate-700 hover:bg-slate-50 lg:hidden shrink-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group shrink-0">
              <Image src="/logo.png" alt="Luxe Nest Households Logo" width={320} height={160} className="h-16 w-auto md:h-20 object-contain transform origin-left hover:scale-105 transition-transform" priority />
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative flex-1 max-w-md mx-auto min-w-0">
              <input
                type="search"
                placeholder="Search products..."
                className="w-full pl-4 pr-10 h-9 md:h-10 bg-slate-50 border border-slate-200 focus:bg-white text-slate-900 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7 md:h-8 md:w-8 rounded-full bg-primary text-white hover:bg-primary/90 transition-all shadow-sm"
              >
                <Search className="h-3.5 w-3.5 md:h-4 md:w-4" />
              </Button>
            </form>

            {/* Wishlist + Cart icons */}
            <div className="flex items-center gap-1 md:gap-2 shrink-0">
              <Button
                variant="ghost"
                asChild
                size="icon"
                className="relative h-10 w-10 md:h-11 md:w-11 rounded-full text-slate-700 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30 transition-all"
              >
                <Link href="/wishlist">
                  <Heart className="h-4 w-4 md:h-5 md:w-5" />
                  {wishlistItems && wishlistItems.length > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full p-0 text-[9px] md:text-[10px] font-bold bg-primary border-2 border-white shadow-sm">
                      {wishlistItems.length > 99 ? "99+" : wishlistItems.length}
                    </Badge>
                  )}
                </Link>
              </Button>

              <Button
                variant="ghost"
                asChild
                size="icon"
                className="relative h-10 w-10 md:h-11 md:w-11 rounded-full text-slate-700 hover:bg-primary/10 hover:text-primary border border-slate-200 hover:border-primary/30 transition-all"
              >
                <Link href="/cart">
                  <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
                  {totalCartItems > 0 && (
                    <Badge className="absolute -right-1 -top-1 flex h-4 w-4 md:h-5 md:w-5 items-center justify-center rounded-full p-0 text-[9px] md:text-[10px] font-bold bg-primary border-2 border-white shadow-sm">
                      {totalCartItems > 99 ? "99+" : totalCartItems}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* TIER 3: Categories Bar — Desktop Only */}
        <nav className="hidden lg:block bg-white border-b border-slate-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-8 h-11">

            {/* All Categories dropdown */}
            <DropdownMenu open={isCategoriesDropdownOpen} onOpenChange={setIsCategoriesDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-800 hover:text-primary transition-colors focus:outline-none">
                  <LayoutGrid className="h-4 w-4" />
                  <span>All Categories</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64 mt-2 rounded-xl shadow-xl border-slate-100 p-2">
                {categoriesLoading ? (
                  <div className="flex items-center justify-center py-4 gap-2 text-slate-400 text-sm">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading…
                  </div>
                ) : categories.length === 0 ? (
                  <p className="text-center py-4 text-xs text-slate-400">No categories found</p>
                ) : (
                  categories.map((cat) => (
                    <DropdownMenuItem
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.name)}
                      className="py-3 px-4 cursor-pointer text-sm font-semibold text-slate-600 hover:text-primary hover:bg-primary/5 rounded-lg transition-colors"
                    >
                      {cat.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Top 5 category hot-links */}
            <div className="flex items-center gap-10 xl:gap-16 flex-1 justify-center">
              {categoriesLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-3 w-16 rounded-full bg-slate-100 animate-pulse" />
                ))
                : topCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-primary relative py-4 px-2 transition-colors group"
                  >
                    <span>{cat.name}</span>
                    <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full" />
                  </button>
                ))}
            </div>

            {/* Shop All */}
            <Link
              href="/shop"
              className="group flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-950 hover:text-primary transition-colors"
            >
              <span>Shop All</span>
              <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </nav>
      </div>

      {/* ============================================================
          MOBILE DRAWER
         ============================================================ */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Slide-in Panel */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              className="fixed left-0 top-0 bottom-0 w-[300px] bg-white z-50 flex flex-col shadow-2xl lg:hidden"
            >
              {/* Drawer header */}
              <div className="px-5 py-4 border-b border-amber-100/60 flex items-center justify-between bg-amber-50/40">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <Image src="/logo.png" alt="Luxe Nest Logo" width={200} height={100} className="h-20 w-auto object-contain" />
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile search */}
              <div className="px-4 py-3 border-b border-slate-100">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="search"
                    placeholder="Search products…"
                    className="w-full pl-4 pr-10 h-10 bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button type="submit" size="icon" className="absolute right-1 top-1 h-8 w-8 rounded-full bg-primary text-white hover:bg-primary/90">
                    <Search className="h-3.5 w-3.5" />
                  </Button>
                </form>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto">

                {/* Quick Nav: Shop / About / Contact */}
                <div className="px-4 pt-5 pb-3 border-b border-slate-100">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3 px-1">Navigate</p>
                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      href="/shop"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-primary text-white py-3 px-2 text-center transition-all hover:bg-primary/90 active:scale-95"
                    >
                      <Store className="h-5 w-5" />
                      <span className="text-[11px] font-bold">Shop</span>
                    </Link>
                    <Link
                      href="/about"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 py-3 px-2 text-center transition-all hover:bg-slate-200 active:scale-95"
                    >
                      <Info className="h-5 w-5" />
                      <span className="text-[11px] font-bold">About</span>
                    </Link>
                    <Link
                      href="/contact"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex flex-col items-center justify-center gap-1.5 rounded-xl bg-slate-100 text-slate-700 py-3 px-2 text-center transition-all hover:bg-slate-200 active:scale-95"
                    >
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-[11px] font-bold">Contact</span>
                    </Link>
                  </div>
                </div>

                {/* Categories */}
                <div className="px-4 py-5">
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mb-3 px-1">Categories</p>
                  <nav className="flex flex-col gap-1">
                    {categoriesLoading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-11 rounded-xl bg-slate-50 animate-pulse" />
                      ))
                    ) : categories.length === 0 ? (
                      <p className="text-sm text-slate-400 px-4 py-2">No categories available</p>
                    ) : (
                      categories.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handleCategoryClick(cat.name)}
                          className="w-full text-left font-semibold text-slate-700 hover:text-primary hover:bg-primary/5 rounded-xl px-4 py-3 text-sm transition-all flex items-center justify-between group"
                        >
                          <span>{cat.name}</span>
                          {cat._count?.products > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">
                              {cat._count.products}
                            </span>
                          )}
                        </button>
                      ))
                    )}

                    <div className="h-px w-full bg-slate-100 my-1" />
                    <button
                      onClick={() => { setIsMobileMenuOpen(false); router.push("/shop") }}
                      className="w-full text-left font-black text-primary hover:bg-primary/5 rounded-xl px-4 py-3 text-sm transition-all flex items-center justify-between"
                    >
                      <span>BROWSE ALL PRODUCTS</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </nav>
                </div>
              </div>

              {/* Drawer footer — contact */}
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Need Help?</p>
                <a href="tel:+254769567516" className="flex items-center gap-2.5 text-slate-800 hover:text-primary font-bold text-sm mb-2 transition-colors">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span>+254 769 567 516</span>
                </a>
                <a href="mailto:sales@luxenest.com" className="flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-[11px] transition-colors">
                  <Mail className="h-3 w-3" />
                  <span className="truncate">sales@luxenest.com</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}