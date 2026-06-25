// @ts-nocheck
"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, useInView, animate } from "framer-motion"

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

const MAIN_DEAL = {
  id: "pro-kitchen-blender",
  name: "High-Speed Pro Blender",
  price: 25000,
  image: "/featured/blender.png",
  category: "APPLIANCES",
}

export default function HeroSection() {
  const { addToCart } = useCart()
  const { toast } = useToast()

  const handleAddToCart = (product) => {
    addToCart(product, 1)
    toast({
      title: "Added to Cart!",
      description: `${product.name} has been added to your cart.`,
      duration: 3000,
    })
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 overflow-hidden">
      <div
        className="relative rounded-3xl min-h-[600px] flex flex-col lg:flex-row items-center justify-between p-8 sm:p-12 lg:p-16 overflow-hidden border shadow-sm"
        style={{
          background: "linear-gradient(135deg, #FAF7F2 0%, #F5EDD9 60%, #EDE0C8 100%)",
          borderColor: "rgba(191,150,48,0.15)"
        }}
      >
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
        <div className="relative z-10 w-full lg:w-1/2 flex flex-col items-start gap-8 pt-10 lg:pt-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col gap-4 items-start"
          >
            <div className="swing-emoji drop-shadow-md">
              <Image src="/logo.png" alt="Luxe Nest Households" width={280} height={140} className="h-24 w-auto md:h-32 object-contain" />
            </div>
            <div
              className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-sm w-fit mt-2"
              style={{ background: "rgba(191,150,48,0.12)", color: "#BF9630" }}
            >
              New Arrival
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1]"
            style={{ color: "#4A3728" }}
          >
            Elevate <br />
            Your Home <br />
            <span style={{ color: "#BF9630" }}>Aesthetics</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-base sm:text-lg max-w-md leading-relaxed"
            style={{ color: "#7A6255" }}
          >
            A premium collection of household products designed for those who appreciate the perfect balance of form and function.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center gap-4 mt-2"
          >
            <Button
              onClick={() => handleAddToCart(MAIN_DEAL)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider rounded-none px-8 h-12 shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              Buy Now &gt;
            </Button>
            <Button
              variant="outline"
              asChild
              className="bg-transparent font-bold uppercase tracking-wider rounded-none px-8 h-12 hover:-translate-y-0.5 transition-all duration-300"
              style={{ borderColor: "rgba(191,150,48,0.4)", color: "#BF9630" }}
            >
              <Link href={`/shop/product/${MAIN_DEAL.id}`}>View Details &gt;</Link>
            </Button>
          </motion.div>
        </div>

        {/* Right Image Column */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex justify-end items-center h-full w-1/2 translate-x-12">
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 60 }}
            className="relative w-[120%] h-[120%]"
          >
            <Image
              src={MAIN_DEAL.image}
              alt={MAIN_DEAL.name}
              fill
              className="object-contain object-right drop-shadow-[0_30px_40px_rgba(0,0,0,0.15)] mix-blend-multiply scale-110"
              priority
            />
          </motion.div>

          {/* Floating Rating Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, type: "spring", stiffness: 100 }}
            className="absolute top-10 right-10 lg:top-20 lg:right-[60%] bg-white p-4 rounded-xl shadow-xl flex flex-col items-center gap-1 z-20"
            style={{ border: "1px solid rgba(191,150,48,0.2)" }}
          >
            <span className="text-xs font-bold" style={{ color: "#4A3728" }}>{MAIN_DEAL.name}</span>
            <div className="flex" style={{ color: "#BF9630" }}>
              <Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current" /><Star className="h-3 w-3 fill-current text-slate-200" />
            </div>
            <span className="text-xs font-black mt-1" style={{ color: "#7A6255" }}>KES {MAIN_DEAL.price.toLocaleString()}</span>
          </motion.div>

          {/* Floating Details Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1, type: "spring" }}
            className="hidden md:flex absolute bottom-16 right-[30%] bg-white/90 backdrop-blur-md p-5 rounded-xl shadow-2xl flex-col gap-4 z-20 w-48"
            style={{ border: "1px solid rgba(191,150,48,0.15)" }}
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#BF9630" }}>Price</p>
              <p className="text-xl font-black" style={{ color: "#4A3728" }}>Ksh {MAIN_DEAL.price.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#BF9630" }}>Color</p>
              <div className="flex gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-slate-900 ring-1 ring-offset-2 ring-slate-900 cursor-pointer"></span>
                <span className="w-3.5 h-3.5 rounded-full bg-slate-300 cursor-pointer"></span>
                <span className="w-3.5 h-3.5 rounded-full cursor-pointer" style={{ background: "#BF9630" }}></span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#BF9630" }}>Category</p>
              <p className="text-sm font-bold uppercase" style={{ color: "#7A6255" }}>{MAIN_DEAL.category}</p>
            </div>
            <div className="relative mt-2 w-full h-16 rounded-lg overflow-hidden group cursor-pointer">
              <Image src="/featured/cutlery.png" alt="Video thumbnail" fill className="object-cover transition-transform group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center backdrop-blur-sm">
                  <Play className="w-3 h-3 text-slate-800 ml-0.5" />
                </div>
              </div>
            </div>
          </motion.div>

        </div>

        {/* Mobile Right Image */}
        <div className="relative z-10 w-full flex lg:hidden justify-center items-center mt-12 h-[350px]">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="relative w-full h-full"
          >
            <Image
              src={MAIN_DEAL.image}
              alt={MAIN_DEAL.name}
              fill
              className="object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.15)] mix-blend-multiply"
              priority
            />
          </motion.div>
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
