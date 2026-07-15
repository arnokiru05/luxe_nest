// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView, animate, AnimatePresence } from "framer-motion"
import { Sparkles, ArrowRight } from "lucide-react"

function AnimatedNumber({ value, duration = 2 }) {
  const [displayValue, setDisplayValue] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (isInView) {
      const controls = animate(0, value, {
        duration,
        onUpdate(v) {
          setDisplayValue(Math.round(v))
        }
      })
      return controls.stop
    }
  }, [isInView, value, duration])

  return <span ref={ref}>{displayValue.toLocaleString()}</span>
}
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Star, Play } from "lucide-react"

export default function HeroSection() {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const [products, setProducts] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetch("/api/products?limit=12&inStock=true")
      .then(res => res.json())
      .then(data => {
        if (cancelled) return
        const arr = Array.isArray(data) ? data : (data.products || [])
        const mapped = arr
          .filter(p => p.stock > 0)
          .map(p => ({
            ...p,
            originalPrice: p.price,
            price: p.discountedPrice || p.price
          }))
        setProducts(mapped)
      })
      .catch(console.error)
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (products.length <= 1) return
    const timer = setInterval(() => {
      // Pick a random product next
      setCurrentIndex(prev => {
        let next = Math.floor(Math.random() * products.length)
        if (next === prev) next = (next + 1) % products.length
        return next
      })
    }, 5000)
    return () => clearInterval(timer)
  }, [products.length])

  const currentDeal = products[currentIndex]

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8 overflow-hidden">
      <div
        className="relative rounded-3xl h-[calc(100dvh-120px)] min-h-[500px] max-h-[700px] lg:h-[calc(100vh-130px)] lg:max-h-[650px] flex flex-col lg:flex-row items-center justify-between p-6 sm:p-8 lg:p-10 overflow-hidden border shadow-sm"
        style={{
          background: "linear-gradient(135deg, #FAF7F2 0%, #F5EDD9 60%, #EDE0C8 100%)",
          borderColor: "rgba(191,150,48,0.15)"
        }}
      >
        {/* Blended Background Images */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[5%] -left-[5%] w-[50%] h-[60%] blur-[3px] opacity-70 mix-blend-multiply transform rotate-6">
            <Image src="/bg1.png" alt="" fill className="object-cover" />
          </div>
          <div className="absolute top-[15%] right-[5%] w-[45%] h-[60%] blur-[3px] opacity-70 mix-blend-multiply transform -rotate-6">
            <Image src="/bg2.png" alt="" fill className="object-cover" />
          </div>
          <div className="absolute -bottom-[10%] left-[15%] w-[55%] h-[60%] blur-[3px] opacity-70 mix-blend-multiply">
            <Image src="/bg3.png" alt="" fill className="object-cover" />
          </div>
        </div>

        {/* Decorative Background Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[600px] h-[600px] rounded-full z-0"
          style={{ background: "radial-gradient(circle, rgba(191,150,48,0.08) 0%, transparent 70%)", boxShadow: "0 0 80px rgba(191,150,48,0.12)" }}
        />
        {/* Botanical leaf dots decoration */}
        <div className="absolute top-8 right-8 w-32 h-32 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #8FAF7E 0%, transparent 70%)" }} />
        <div className="absolute bottom-12 left-12 w-20 h-20 rounded-full opacity-15" style={{ background: "radial-gradient(circle, #BF9630 0%, transparent 70%)" }} />

        {/* Left Content Column */}
        <div className="relative z-20 flex flex-col justify-center items-start w-full lg:w-1/2 h-auto lg:h-full gap-4 lg:gap-6 shrink-0 pt-4 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-2 sm:gap-3 items-start"
          >
            <div className="swing-emoji drop-shadow-md">
              <Image src="/logo.png" alt="Luxe Nest Households" width={280} height={140} className="h-16 sm:h-20 w-auto md:h-24 object-contain" />
            </div>
            <div
              className="flex items-center gap-2 mb-2 mt-4 bg-white/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/60 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-[#BF9630]" />
              <span className="text-xs font-black tracking-[0.2em] uppercase text-[#BF9630] drop-shadow-sm">
                New Arrival
              </span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]"
            style={{ color: "#4A3728" }}
          >
            Elevate <br />
            Your Home <br />
            <span style={{ color: "#BF9630" }}>Aesthetics</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="max-w-md text-base md:text-lg lg:text-xl font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] text-[#2D1A11] leading-relaxed">
              A premium collection of household products designed for those who appreciate the perfect balance of form and function.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-3 sm:gap-4 mt-1 sm:mt-2 w-full sm:w-auto"
          >
            <Button
              onClick={() => {
                if (currentDeal) handleAddToCart(currentDeal)
              }}
              disabled={!currentDeal}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider rounded-none px-6 sm:px-8 h-10 sm:h-12 shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm"
            >
              Buy Now &gt;
            </Button>
            <Button
              variant="outline"
              asChild={!!currentDeal}
              disabled={!currentDeal}
              className="bg-transparent font-black uppercase tracking-wider rounded-none px-6 sm:px-8 h-10 sm:h-12 hover:-translate-y-0.5 hover:bg-[#4A3728] hover:text-white transition-all duration-300 flex-1 sm:flex-none text-xs sm:text-sm"
              style={{ borderColor: "#4A3728", color: "#4A3728", borderWidth: "2px" }}
            >
              {currentDeal ? (
                <Link href={`/shop/product/${currentDeal.id}`}>View Details &gt;</Link>
              ) : (
                <span>View Details &gt;</span>
              )}
            </Button>
          </motion.div>
        </div>

        {/* Right Image Column */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex justify-end items-center h-full w-1/2 translate-x-12">
          {isLoading ? (
            <div className="w-[400px] h-[400px] flex items-center justify-center mr-20">
              <span className="text-[#BF9630] font-bold tracking-widest text-sm uppercase">Loading...</span>
            </div>
          ) : !currentDeal ? (
            <div className="w-[400px] h-[400px] flex flex-col items-center justify-center mr-20 border-2 border-dashed border-[#BF9630]/30 rounded-full bg-white/20 backdrop-blur-sm">
              <span className="text-4xl mb-4 opacity-50">✨</span>
              <p className="text-sm font-bold uppercase tracking-widest text-[#4A3728]">New Collections</p>
              <p className="text-xs text-[#7A6255] mt-1">Coming Soon</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDeal.id}
                initial={{ opacity: 0, x: 50, rotate: 5 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -50, rotate: -5 }}
                transition={{ type: "spring", stiffness: 60 }}
                className="relative w-full h-full flex items-center justify-end mr-10"
              >
                <div className="relative w-[120%] h-[120%]">
                  <Image
                    src={currentDeal.images?.[0]?.url || "/placeholders/filter.jpeg"}
                    alt={currentDeal.name}
                    fill
                    className="object-contain object-right drop-shadow-[0_30px_40px_rgba(0,0,0,0.15)] mix-blend-multiply scale-110"
                    priority
                  />
                </div>

                {/* Floating Rating Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
                  className="absolute top-20 right-[60%] bg-white p-4 rounded-xl shadow-xl flex flex-col items-center gap-1 z-20"
                  style={{ border: "1px solid rgba(191,150,48,0.2)" }}
                >
                  <span className="text-xs font-bold" style={{ color: "#4A3728" }}>{currentDeal.name}</span>
                  <div className="flex" style={{ color: "#BF9630" }}>
                    <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current text-slate-200" />
                  </div>
                  <span className="text-xs font-black mt-1" style={{ color: "#7A6255" }}>KES {Number(currentDeal.price).toLocaleString()}</span>
                </motion.div>

                {/* Floating Details Card */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="hidden md:flex absolute bottom-12 right-[30%] bg-white/90 backdrop-blur-md p-5 rounded-xl shadow-2xl flex-col gap-3 z-20 w-48"
                  style={{ border: "1px solid rgba(191,150,48,0.15)" }}
                >
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#BF9630" }}>Price</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xl font-black" style={{ color: "#4A3728" }}>Ksh {Number(currentDeal.price).toLocaleString()}</p>
                      {currentDeal.discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                          -{currentDeal.discountPercent}%
                        </span>
                      )}
                    </div>
                    {currentDeal.discountPercent > 0 && (
                      <p className="text-xs line-through text-red-400">Ksh {Number(currentDeal.originalPrice).toLocaleString()}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#BF9630" }}>Color</p>
                    <div className="flex gap-2">
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-1 ring-offset-2 ring-slate-900 cursor-pointer"></span>
                      <span className="w-3.5 h-3.5 rounded-full bg-slate-300 cursor-pointer"></span>
                      <span className="w-3.5 h-3.5 rounded-full cursor-pointer" style={{ background: currentDeal.color || "#BF9630" }}></span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#BF9630" }}>Category</p>
                    <p className="text-sm font-bold uppercase" style={{ color: "#7A6255" }}>{currentDeal.category?.name || "General"}</p>
                  </div>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Mobile Right Image */}
        <div className="relative z-10 w-full flex-1 flex lg:hidden justify-end items-end pb-2 sm:pb-4 pr-1 sm:pr-2">
          {currentDeal ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDeal.id}
                initial={{ opacity: 0, scale: 0.9, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                className="relative w-[85%] sm:w-[70%] max-w-[320px] min-h-[260px] h-[100%] max-h-[340px] bg-white/60 backdrop-blur-xl rounded-[2rem] border border-white/70 shadow-2xl flex flex-col p-4 z-20 mt-2"
              >
                {/* Image Container */}
                <div className="relative w-full flex-1 min-h-[140px]">
                  <Image
                    src={currentDeal.images?.[0]?.url || "/placeholders/filter.jpeg"}
                    alt={currentDeal.name}
                    fill
                    className="object-contain drop-shadow-[0_15px_25px_rgba(0,0,0,0.15)] mix-blend-multiply"
                    priority
                  />
                </div>
                
                {/* Product Info Bar */}
                <div className="w-full flex items-end justify-between gap-2 mt-3 pt-3 border-t border-white/60 shrink-0">
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#BF9630]">Featured</span>
                    <span className="text-sm font-bold text-[#4A3728] truncate pr-2">{currentDeal.name}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5">
                      {currentDeal.discountPercent > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded-sm">
                          -{currentDeal.discountPercent}%
                        </span>
                      )}
                      <span className="text-sm font-black text-[#7A6255] whitespace-nowrap">KES {Number(currentDeal.price).toLocaleString()}</span>
                    </div>
                    {currentDeal.discountPercent > 0 && (
                      <span className="text-[10px] line-through text-red-400 whitespace-nowrap">KES {Number(currentDeal.originalPrice).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-[#BF9630]/30 rounded-3xl bg-white/20 backdrop-blur-sm">
              <span className="text-4xl mb-2 opacity-50">✨</span>
              <p className="text-sm font-bold uppercase tracking-widest text-[#4A3728]">Coming Soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Features Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 px-4 py-10 border-b" style={{ borderColor: "rgba(191,150,48,0.15)" }}>
        {[
          { num: 1000, suffix: "+", desc: "Orders delivered" },
          { num: 99, suffix: "%", desc: "Satisfaction rate" },
          { title: "24/7", desc: "Online support" },
          { num: 7, suffix: " Days", desc: "Money back guarantee" }
        ].map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-start gap-1"
          >
            <h4 className="text-3xl font-black text-primary tracking-tight">
              {feature.num !== undefined ? (
                <>
                  <AnimatedNumber value={feature.num} />
                  {feature.suffix}
                </>
              ) : (
                feature.title
              )}
            </h4>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#8FAF7E" }}>{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
