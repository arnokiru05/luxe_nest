// @ts-nocheck
"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowLeft, Loader2, ChevronLeft, ChevronRight } from "lucide-react"

const FALLBACK_PRODUCTS = [
  {
    id: "pro-blender",
    name: "High-Speed Pro Blender",
    price: 25000,
    discount: "20%",
    image: "/featured/blender.png",
    category: "Appliances",
    description: "Premium professional blender for the modern kitchen.",
  },
  {
    id: "modern-lamp",
    name: "Modern Kitchen Pendant",
    price: 12400,
    image: "/featured/lamp.png",
    category: "Lighting",
    description: "Sleek pendant lamp for warm ambient kitchen lighting.",
  },
  {
    id: "cutlery-set",
    name: "Premium Cutlery Set",
    price: 8500,
    image: "/featured/cutlery.png",
    category: "Cutlery",
    description: "Elegant stainless steel cutlery set for everyday dining.",
  },
  {
    id: "stand-mixer",
    name: "Premium Stand Mixer",
    price: 45000,
    discount: "18%",
    image: "/featured/blender.png",
    category: "Appliances",
    description: "Luxurious stand mixer, the centerpiece for baking enthusiasts.",
  },
]

export default function FeaturedProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [hoveredIndex, setHoveredIndex] = useState(null)

  // Carousel state
  const carouselRef = useRef(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const res = await fetch("/api/products?featured=true&limit=4")
        if (!res.ok) throw new Error("Failed to fetch featured products")
        const data = await res.json()
        const fetched = data.products || []
        setProducts(fetched.length > 0 ? fetched : FALLBACK_PRODUCTS)
      } catch (err) {
        console.error("Error loading featured products:", err)
        setProducts(FALLBACK_PRODUCTS)
      } finally {
        setLoading(false)
      }
    }
    fetchFeatured()
  }, [])

  // Carousel scroll helpers
  const checkCarouselScroll = useCallback(() => {
    const el = carouselRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setShowLeftArrow(scrollLeft > 10)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    const cardWidth = 290 + 20 // card width + gap
    el.scrollBy({ left: dir === "right" ? cardWidth : -cardWidth, behavior: "smooth" })
    setTimeout(checkCarouselScroll, 400)
  }

  // Auto-scroll carousel every 3.5s on mobile
  useEffect(() => {
    const el = carouselRef.current
    if (!el || !products.length) return
    let paused = false

    const autoScroll = setInterval(() => {
      if (paused) return
      const { scrollLeft, scrollWidth, clientWidth } = el
      if (scrollLeft + clientWidth >= scrollWidth - 10) {
        el.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        el.scrollBy({ left: 290 + 20, behavior: "smooth" })
      }
      setTimeout(checkCarouselScroll, 400)
    }, 3500)

    const handleTouch = () => { paused = true }
    el.addEventListener("touchstart", handleTouch)

    return () => {
      clearInterval(autoScroll)
      el.removeEventListener("touchstart", handleTouch)
    }
  }, [products, checkCarouselScroll])

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end pb-6" style={{ borderBottom: "1px solid rgba(191,150,48,0.2)" }}>
        <div>
          <span className="inline-block text-[10px] font-black tracking-widest uppercase text-primary mb-2">
            Top Sale
          </span>
          <h2 className="text-3xl font-black tracking-tight md:text-4xl leading-none" style={{ color: "#4A3728" }}>
            Featured Products
          </h2>
          <p className="mt-2 text-sm max-w-md" style={{ color: "#7A6255" }}>
            Hand-picked premium household essentials for modern living.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-none font-bold text-xs uppercase tracking-wider px-6 h-10 flex items-center gap-2 group transition-all shrink-0"
          style={{ borderColor: "rgba(191,150,48,0.4)", color: "#BF9630" }}
        >
          <Link href="/shop">
            <span>Browse All Items</span>
            <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>

      {/* Products */}
      {loading ? (
        <div className="flex items-center justify-center h-[380px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary/50" />
            <p className="text-xs" style={{ color: "#BF9630" }}>Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Infinite Scroll Marquee */}
          <div className="relative w-full overflow-hidden flex flex-col group/marquee">
            {/* The fading edges */}
            <div className="absolute inset-y-0 left-0 w-8 md:w-24 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-8 md:w-24 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />

            {/* Marquee Container */}
            <div className="flex gap-6 w-max animate-marquee hover:[animation-play-state:paused] py-8">
              {[...products, ...products, ...products, ...products].map((product, index) => (
                <div
                  key={`${product.id}-${index}`}
                  className="w-[280px] md:w-[320px] shrink-0 transition-all duration-500 hover:-translate-y-4 hover:shadow-2xl z-20"
                >
                  <ProductCard
                    product={{
                      ...product,
                      category: product.category?.name || product.category || "General",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
