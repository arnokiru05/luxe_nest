// @ts-nocheck
"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import Link from "next/link"

const features = [
  {
    title: "Quality Assurance",
    description:
      "Every product in our collection is carefully curated and inspected to ensure it meets our high standards of craftsmanship and durability.",
    icon: "✦",
  },
  {
    title: "Expert Curation",
    description:
      "Our team of interior design enthusiasts hand-picks each item to ensure it fits seamlessly into a modern, minimalist home.",
    icon: "✦",
  },
  {
    title: "Fast Delivery",
    description:
      "We offer quick and reliable nationwide delivery so your premium household pieces arrive when you need them.",
    icon: "✦",
  },
  {
    title: "Competitive Pricing",
    description:
      "We work directly with artisans and suppliers to offer the best prices without ever compromising on quality.",
    icon: "✦",
  },
  {
    title: "Wide Selection",
    description:
      "From living room accents to kitchen essentials and bathroom luxuries — we stock everything to elevate every room.",
    icon: "✦",
  },
  {
    title: "Customer Satisfaction",
    description:
      "Your satisfaction is our highest priority, backed by our responsive support team and hassle-free return policy.",
    icon: "✦",
  },
]

export default function AboutPage() {
  return (
    <div className="bg-[#FAFAF9] min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-64 md:h-80 overflow-hidden">
        <Image
          src="/about-decor.png"
          alt="Luxe Nest — Premium Household Decor"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-slate-900/20 to-[#FAFAF9]" />
        <div className="absolute bottom-0 left-0 right-0 pb-8 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-[#93c572] mb-2">
              Our Story
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-lg">
              About Luxe Nest
            </h1>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center text-slate-500 text-base mb-16"
        >
          Curate Beauty &nbsp;|&nbsp; Elevate Living &nbsp;|&nbsp; Inspire Comfort
        </motion.p>

        {/* Two-column: Story + Values */}
        <div className="grid gap-16 md:grid-cols-2 mb-20">
          {/* Our Story */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-6"
          >
            <div>
              <span className="inline-block text-[10px] font-black tracking-widest uppercase text-[#93c572] mb-3">
                Who We Are
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight mb-4">
                Premium Household Goods,<br /> Crafted for Modern Living
              </h2>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Luxe Nest is committed to curating premium, minimalist household essentials that transform
              everyday living. We believe your home should be a reflection of refined taste and effortless comfort.
            </p>
            <p className="text-slate-500 leading-relaxed">
              Over the years, we've built strong relationships with artisans and designers across the region,
              enabling us to offer an exquisite range of decor, lighting, kitchenware, and home accessories —
              all selected to bring harmony and warmth to every room.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-2 bg-[#93c572] hover:bg-[#7db35a] text-white font-black text-xs uppercase tracking-widest px-6 py-3 rounded-none transition-all w-fit shadow-sm hover:-translate-y-0.5"
            >
              Shop The Collection →
            </Link>
          </motion.div>

          {/* Decor Image — second instance, smaller */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-xl border border-slate-100"
          >
            <Image
              src="/about-decor.png"
              alt="Luxe Nest — Minimalist Home Decor"
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {/* Floating badge */}
            <div className="absolute bottom-5 left-5 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 shadow-lg border border-slate-100">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Trusted Since</p>
              <p className="text-xl font-black text-slate-800">2021</p>
            </div>
          </motion.div>
        </div>

        {/* Why Choose Us */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-[#93c572] mb-3">
              Why Luxe Nest
            </span>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              The Luxe Nest Difference
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.08 }}
                className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="inline-block text-[#93c572] font-black text-lg mb-3">{feature.icon}</span>
                <h3 className="font-black text-slate-800 text-base mb-2 group-hover:text-[#93c572] transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="relative overflow-hidden rounded-3xl bg-slate-900 text-white text-center px-8 py-16"
        >
          <div className="absolute inset-0 opacity-10">
            <Image src="/about-decor.png" alt="" fill className="object-cover" />
          </div>
          <div className="relative z-10">
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-[#93c572] mb-3">
              Start Today
            </span>
            <h3 className="text-2xl md:text-4xl font-black tracking-tight mb-4">
              Ready to Elevate Your Home?
            </h3>
            <p className="text-slate-400 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Browse our curated collection of premium minimalist household goods and transform your living space today.
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#93c572] hover:bg-[#7db35a] text-white font-black text-xs uppercase tracking-widest px-8 py-4 rounded-none transition-all shadow-lg hover:-translate-y-0.5"
            >
              Shop Now →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
