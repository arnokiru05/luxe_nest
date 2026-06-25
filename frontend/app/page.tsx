// @ts-nocheck
import Link from "next/link"
import { Button } from "@/components/ui/button"
import HeroSection from "@/components/hero-section"
import FeaturedProducts from "@/components/featured-products"
import CategoryShowcase from "@/components/category-showcase"

export const metadata = {
  title: "Luxe Nest | Premium Household Goods",
  description: "Discover premium household items to elevate your living space.",
}

export default function Home() {
  return (
    <div className="flex flex-col pb-20">
      <HeroSection />
      <FeaturedProducts />
      <CategoryShowcase />

      {/* CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-10">
        <div className="relative bg-[#F7F5F0] rounded-2xl px-8 py-16 text-center overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 left-1/4 -translate-y-1/2 w-48 h-48 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute bottom-0 right-1/4 translate-y-1/2 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative z-10">
            <span className="inline-block text-[10px] font-black tracking-widest uppercase text-primary mb-3">
              Elevate Your Space
            </span>
            <h2 className="mb-4 text-3xl font-black tracking-tight md:text-5xl text-slate-800 leading-tight max-w-2xl mx-auto">
              Ready to elevate your living space?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-sm text-slate-500 leading-relaxed">
              Browse our curated collection of premium household essentials. Designed for those who appreciate the perfect balance of form and function.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-white font-bold px-10 rounded-none uppercase tracking-wider shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-12"
              >
                <Link href="/shop">Shop Now</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="bg-transparent border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900 font-bold px-10 rounded-none uppercase tracking-wider h-12 transition-all duration-300"
              >
                <Link href="/contact">Contact Us</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
