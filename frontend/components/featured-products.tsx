// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import ProductCard from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Loader2, Star } from "lucide-react"

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
    name: "Minimalist Cutlery Set",
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

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 md:px-6 lg:px-8">
      {/* Section Header */}
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end border-b border-slate-100 pb-6">
        <div>
          <span className="inline-block text-[10px] font-black tracking-widest uppercase text-primary mb-2">
            Top Sale
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl leading-none">
            Featured Product
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            Hand-picked premium household essentials for modern, minimalist living.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="rounded-none border-slate-300 text-slate-700 hover:border-primary hover:text-primary font-bold text-xs uppercase tracking-wider px-6 h-10 flex items-center gap-2 group transition-all shrink-0"
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
            <p className="text-xs text-slate-400">Loading products...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop: Accordion Hover Expand */}
          <div className="hidden lg:flex flex-row w-full items-stretch gap-4 h-[440px] overflow-hidden">
            {products.map((product, index) => {
              const isHovered = hoveredIndex === index
              const isAnyHovered = hoveredIndex !== null
              const width = isAnyHovered ? (isHovered ? "46%" : "18%") : "25%"

              return (
                <div
                  key={product.id}
                  style={{ width, transition: "width 0.6s cubic-bezier(0.25, 1, 0.5, 1)" }}
                  className="h-full shrink-0"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <ProductCard
                    product={{
                      ...product,
                      category: product.category?.name || product.category || "General",
                    }}
                    isAccordion={true}
                    isExpanded={isHovered}
                  />
                </div>
              )
            })}
          </div>

          {/* Mobile: Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:hidden">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard
                  product={{
                    ...product,
                    category: product.category?.name || product.category || "General",
                  }}
                />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
