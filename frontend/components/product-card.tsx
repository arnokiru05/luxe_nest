// @ts-nocheck
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, Heart, Search, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useWishlist } from "@/context/wishlist-context"
import { useToast } from "@/components/ui/use-toast"
import QuickOrderModal from "@/components/quick-order-modal"

const WhatsAppIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.968C16.774 1.97 14.301.945 11.67.945c-5.445 0-9.87 4.37-9.874 9.8.001 1.73.473 3.42 1.37 4.933l-.994 3.633 3.734-.979zm11.235-5.326c-.29-.146-1.72-.849-1.986-.946-.266-.097-.461-.146-.656.146-.195.29-.757.946-.927 1.14-.17.195-.341.219-.632.074-2.905-1.448-4.78-2.889-5.653-4.387-.23-.395-.024-.61.176-.81.18-.18.395-.461.593-.69.199-.23.266-.388.398-.656.132-.266.066-.51-.033-.704-.097-.195-.757-1.823-1.037-2.5-.273-.656-.55-.568-.757-.578-.195-.008-.419-.01-.643-.01-.224 0-.59.084-.898.419-.308.334-1.18 1.153-1.18 2.81 0 1.657 1.205 3.255 1.37 3.48.165.224 2.37 3.62 5.74 5.076 2.27.979 3.187 1.053 4.327.886.747-.11 1.72-.702 1.961-1.38.24-.679.24-1.261.17-1.38-.073-.119-.266-.194-.556-.34z" />
  </svg>
)

export default function ProductCard({ product, onQuickView }) {
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { toast } = useToast()
  
  const inWish = isInWishlist(product.id)
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false)

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
    toast({
      title: "Added to Cart",
      description: `${product.name} (KES ${product.price.toLocaleString()}) has been added.`,
    })
  }

  const toggleWishlist = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (inWish) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleWhatsAppOrder = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsQuickOrderOpen(true)
  }

  return (
    <div className="group h-full flex flex-col bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden relative w-full border border-slate-50">
      
      {/* 1. PRODUCT IMAGE + HOVER ICON ACTIONS */}
      <div className="relative aspect-square w-full bg-[#FAFAF9] flex items-center justify-center p-6 overflow-hidden">
        
        {/* SALE Badge */}
        {product.discount && (
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-1">
            <span className="border border-primary text-primary bg-white/90 font-bold text-[10px] tracking-wider px-2 py-0.5 rounded-full shadow-sm backdrop-blur-sm">
              -{product.discount}
            </span>
          </div>
        )}

        {/* Main Product Image */}
        <Link href={`/shop/product/${product.id}`} className="relative w-full h-full transform group-hover:scale-105 transition-transform duration-500 block">
          <Image
            src={product.image || "/placeholders/filter.jpeg"}
            alt={product.name}
            fill
            sizes="280px"
            className="object-contain mix-blend-multiply drop-shadow-md"
            priority={false}
          />
        </Link>

        {/* Floating Circle Button (from image) */}
        <button 
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (onQuickView) onQuickView(product)
            else handleAddToCart(e)
          }}
          className="absolute bottom-4 right-4 h-10 w-10 bg-primary/90 hover:bg-primary text-white rounded-full flex items-center justify-center shadow-lg transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Hover action icons (eye, heart, cart) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 transform translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onQuickView(product)
              }}
              className="h-8 w-8 bg-white text-slate-600 hover:text-primary rounded-full flex items-center justify-center shadow-md transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={toggleWishlist}
            className="h-8 w-8 bg-white text-slate-600 hover:text-primary rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <Heart className={`h-4 w-4 ${inWish ? "fill-primary text-primary" : ""}`} />
          </button>
          <button
            onClick={handleAddToCart}
            className="h-8 w-8 bg-white text-slate-600 hover:text-primary rounded-full flex items-center justify-center shadow-md transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* 2. CARD METADATA CONTENT AREA */}
      <Link href={`/shop/product/${product.id}`} className="flex-1 px-5 pt-4 pb-2 flex flex-col justify-between items-start text-left">
        <div className="space-y-1 w-full">
          {/* Product Title */}
          <h3 className="text-sm font-bold text-slate-800 tracking-tight leading-snug line-clamp-1">
            {product.name}
          </h3>



          {/* Pricing details */}
          <div className="flex flex-col items-start pt-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-900 font-black text-sm">
                KES {Number(product.price).toLocaleString()}
              </span>
              {product.discount && product.originalPrice && (
                <span className="text-slate-400 text-xs line-through font-medium">
                  KES {Number(product.originalPrice).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* 3. DUAL ACTION CTA BUTTONS */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-2 pt-3">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-white text-[10px] font-bold tracking-wider uppercase rounded-none transition-all shadow-sm flex items-center justify-center"
          >
            Add to Cart
          </Button>

          <Button
            variant="outline"
            onClick={handleWhatsAppOrder}
            size="sm"
            className="flex-1 bg-transparent border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-[#25D366] text-[10px] font-bold tracking-wider uppercase rounded-none transition-all flex items-center justify-center shadow-sm"
          >
            <WhatsAppIcon className="h-3.5 w-3.5 shrink-0 fill-current mr-1 text-[#25D366]" />
            WhatsApp
          </Button>
        </div>
      </div>

      <QuickOrderModal 
        product={product} 
        isOpen={isQuickOrderOpen} 
        onClose={() => setIsQuickOrderOpen(false)} 
      />
    </div>
  )
}
