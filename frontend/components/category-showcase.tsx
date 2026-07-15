// @ts-nocheck
"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence, animate } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  X,
  Star,
  Loader2,
} from "lucide-react"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product-card"
import QuickOrderModal from "@/components/quick-order-modal"

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.774 1.97 14.301.945 11.67.945c-5.445 0-9.87 4.37-9.874 9.8.001 1.73.473 3.42 1.37 4.933l-.994 3.633 3.734-.979zm11.235-5.326c-.29-.146-1.72-.849-1.986-.946-.266-.097-.461-.146-.656.146-.195.29-.757.946-.927 1.14-.17.195-.341.219-.632.074-2.905-1.448-4.78-2.889-5.653-4.387-.23-.395-.024-.61.176-.81.18-.18.395-.461.593-.69.199-.23.266-.388.398-.656.132-.266.066-.51-.033-.704-.097-.195-.757-1.823-1.037-2.5-.273-.656-.55-.568-.757-.578-.195-.008-.419-.01-.643-.01-.224 0-.59.084-.898.419-.308.334-1.18 1.153-1.18 2.81 0 1.657 1.205 3.255 1.37 3.48.165.224 2.37 3.62 5.74 5.076 2.27.979 3.187 1.053 4.327.886.747-.11 1.72-.702 1.961-1.38.24-.679.24-1.261.17-1.38-.073-.119-.266-.194-.556-.34z" />
  </svg>
)

// Promos will be dynamically generated from products with discounts.
export default function CategoryShowcase() {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("all")
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false)

  const scrollRef = useRef(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  // API State
  const [categories, setCategories] = useState([{ name: "All Products", value: "all" }])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products")
        ])
        
        if (catRes.ok) {
          const catData = await catRes.json()
          setCategories([
            { name: "All Products", value: "all" },
            ...(catData || []).map(c => ({ name: c.name, value: c.name }))
          ])
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json()
          const fetched = Array.isArray(prodData) ? prodData : (prodData.products || [])
          
          const formatted = fetched.map(p => ({
            ...p,
            originalPrice: p.price,
            price: p.discountedPrice || p.price,
            image: p.images?.[0]?.url || null,
            category: p.category?.name || "General",
            discount: p.discountPercent ? `${p.discountPercent}%` : null,
            inStock: p.stock > 0
          }))
          setProducts(formatted)
        }
      } catch (e) {
        console.error("Failed to load showcase data", e)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = activeTab === "all"
    ? products
    : products.filter((p) => p.category === activeTab)

  const deals = products.filter(p => p.discount).slice(0, 2)

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 10)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 2)
    }
  }

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0
    checkScroll()
    const t = setTimeout(checkScroll, 150)
    return () => clearTimeout(t)
  }, [activeTab])

  const handleArrowScroll = (direction) => {
    const el = scrollRef.current
    if (!el) return
    const { clientWidth, scrollLeft, scrollWidth } = el
    const offset = clientWidth * 0.75
    const start = scrollLeft
    const target = direction === "left"
      ? Math.max(0, start - offset)
      : Math.min(scrollWidth - clientWidth, start + offset)

    animate(start, target, {
      type: "spring",
      stiffness: 75,
      damping: 18,
      mass: 0.8,
      onUpdate: (v) => {
        if (el) {
          el.scrollLeft = v
          setShowLeftArrow(v > 10)
          setShowRightArrow(v < scrollWidth - clientWidth - 10)
        }
      },
      onComplete: checkScroll,
    })
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    toast({ title: "Added to Cart", description: `${product.name} (KES ${product.price.toLocaleString()}) added.` })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-10">

      {/* Deal Banners Row */}
      {deals.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          {deals.map((deal, i) => (
            <motion.div
              key={deal.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="relative flex items-center justify-between rounded-2xl overflow-hidden px-8 py-6 group hover:shadow-md transition-all h-full"
              style={{ background: "linear-gradient(135deg, #FAF6EE 0%, #F2E8D5 100%)", border: "1px solid rgba(191,150,48,0.15)" }}
            >
              <div className="z-10 flex-1 pr-4">
                <span className="text-[10px] font-black uppercase tracking-widest block mb-1" style={{ color: "#BF9630" }}>
                  GET {deal.discount} OFF
                </span>
                <h3 className="text-xl font-black leading-tight mb-3 line-clamp-2" style={{ color: "#4A3728" }}>{deal.name}</h3>
                <Button
                  asChild
                  className="text-white font-bold text-[11px] uppercase tracking-wider rounded-none px-5 h-9"
                  style={{ background: "#BF9630" }}
                >
                  <Link href={`/shop/product/${deal.id}`}>Buy Now &gt;</Link>
                </Button>
              </div>
              <div className="relative h-32 w-32 md:h-40 md:w-40 shrink-0 transform group-hover:scale-105 transition-transform duration-500">
                <Image src={deal.image || "/placeholders/filter.jpeg"} alt={deal.name} fill className="object-contain mix-blend-multiply drop-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Popular Categories Header ─── */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 pb-6 md:flex-row md:items-center" style={{ borderBottom: "1px solid rgba(191,150,48,0.18)" }}>
        <div>
          <h2 className="text-3xl font-black tracking-tight leading-none" style={{ color: "#4A3728" }}>Popular Categories</h2>
          <p className="mt-1.5 text-sm" style={{ color: "#7A6255" }}>Browse our premium household collection by category.</p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-full max-w-full overflow-x-auto" style={{ background: "#F5EDD9", border: "1px solid rgba(191,150,48,0.2)" }}>
          {categories.map((tab) => {
            const isActive = activeTab === tab.value
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-[10px] font-black tracking-wider uppercase rounded-full transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-primary text-white shadow-md"
                    : "text-slate-600 hover:text-slate-900 hover:bg-white/70"
                }`}
              >
                {tab.name}
              </button>
            )
          })}
        </div>

        <Button
          asChild
          className="rounded-none text-white font-bold text-xs uppercase tracking-wider h-10 px-6 flex items-center gap-1.5 transition-all shadow-sm shrink-0 hover:opacity-90"
          style={{ background: "#4A3728" }}
        >
          <Link href="/shop">
            <span>All Products</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* ─── Scrollable Product Carousel ─── */}
      {loading ? (
        <div className="flex items-center justify-center h-[340px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-7 w-7 animate-spin text-primary/50" />
            <p className="text-xs" style={{ color: "#BF9630" }}>Loading products...</p>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-[#BF9630]/30 rounded-2xl bg-[#FAFAF9]/50">
          <span className="text-4xl mb-4 opacity-50">✨</span>
          <h3 className="text-lg font-bold" style={{ color: "#4A3728" }}>More products coming soon</h3>
          <p className="text-sm mt-1" style={{ color: "#7A6255" }}>We are currently updating our collection.</p>
        </div>
      ) : (
        <div className="relative group/carousel">
          {showLeftArrow && (
            <button
              onClick={() => handleArrowScroll("left")}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-700 shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:bg-primary hover:text-white hover:border-primary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          {showRightArrow && (
            <button
              onClick={() => handleArrowScroll("right")}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 z-20 h-10 w-10 rounded-full bg-white border border-slate-200 text-slate-700 shadow-lg flex items-center justify-center transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 hover:bg-primary hover:text-white hover:border-primary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}

          <div
            ref={scrollRef}
            className="w-full flex items-stretch gap-5 overflow-x-auto pb-4 scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            onScroll={checkScroll}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="flex items-stretch gap-5 min-w-min"
              >
                {filteredProducts.length === 0 ? (
                  <div className="w-full min-w-[260px] flex items-center justify-center py-20 text-slate-400 text-sm">
                    No products in this category yet.
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <div key={product.id} className="w-[260px] sm:w-[290px] shrink-0">
                      <ProductCard product={product} onQuickView={setSelectedProduct} />
                    </div>
                  ))
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* ─── Quick View Modal ─── */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full relative z-10 shadow-2xl border border-slate-100 flex flex-col md:flex-row gap-6 items-stretch"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute right-4 top-4 h-8 w-8 rounded-full bg-slate-50 hover:bg-slate-100 border border-slate-200/50 text-slate-700 flex items-center justify-center cursor-pointer transition-colors z-20"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Image */}
              <div className="w-full md:w-1/2 aspect-square relative bg-[#FAFAF9] rounded-xl flex items-center justify-center p-4">
                {selectedProduct.discount && (
                  <span className="absolute left-4 top-4 bg-[#cca97f] text-white font-black text-[9px] tracking-widest px-2.5 py-0.5 rounded-full uppercase shadow-sm z-10">
                    SALE {selectedProduct.discount}
                  </span>
                )}
                <div className="relative w-full h-full">
                  <Image src={selectedProduct.image} alt={selectedProduct.name} fill className="object-contain mix-blend-multiply" sizes="280px" />
                </div>
              </div>

              {/* Details */}
              <div className="w-full md:w-1/2 flex flex-col justify-between pt-2">
                <div className="space-y-3">
                  <span className="text-[10px] font-black tracking-widest text-primary uppercase">{selectedProduct.category}</span>
                  <h3 className="text-xl font-black text-slate-800 tracking-tight leading-tight">{selectedProduct.name}</h3>
                  <div className="flex items-center gap-1 text-[#F5B041]">
                    {[...Array(4)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
                    <Star className="h-3.5 w-3.5 text-slate-200" />
                    <span className="text-[11px] text-slate-400 ml-1">(24 reviews)</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-slate-800">KES {selectedProduct.price.toLocaleString()}</span>
                    {selectedProduct.originalPrice && (
                      <span className="text-sm text-slate-400 line-through">KES {selectedProduct.originalPrice.toLocaleString()}</span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed text-slate-500">{selectedProduct.description}</p>
                </div>

                <div className="flex flex-col gap-2 pt-5 mt-5 border-t border-slate-100">
                  <button
                    onClick={(e) => { handleAddToCart(e, selectedProduct); setSelectedProduct(null) }}
                    className="w-full bg-primary hover:bg-primary/90 text-white text-[11px] font-black tracking-wider uppercase py-3.5 rounded-none transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4 shrink-0" />
                    <span>Add to Cart</span>
                  </button>
                  <button
                    onClick={() => { setIsQuickOrderOpen(true) }}
                    className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-black tracking-wider uppercase py-3.5 rounded-none transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <WhatsAppIcon className="h-4 w-4 shrink-0" />
                    <span>Order via WhatsApp</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <QuickOrderModal
        product={selectedProduct}
        isOpen={isQuickOrderOpen}
        onClose={() => { setIsQuickOrderOpen(false); setSelectedProduct(null) }}
      />
    </section>
  )
}
