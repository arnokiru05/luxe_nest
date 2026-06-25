// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Heart, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWishlist } from "@/context/wishlist-context"
import { useCart } from "@/context/cart-context"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ProductCard from "@/components/product-card"

export default function WishlistPage() {
  const router = useRouter()
  const { wishlistItems, clearWishlist } = useWishlist()
  const { cartItems } = useCart()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header Section */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-slate-950">My Wishlist</h1>
            <p className="text-sm text-slate-500 mt-1">Products you've saved for later</p>
          </div>
          
          {wishlistItems.length > 0 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={clearWishlist}
                className="rounded-full px-6 border-slate-200 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-700 transition-all"
              >
                Clear Wishlist
              </Button>
              <Button 
                onClick={() => router.push("/shop")}
                className="rounded-full px-6 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all"
              >
                Continue Shopping
              </Button>
            </div>
          )}
        </div>

        {/* Wishlist Grid */}
        {wishlistItems.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-100 bg-white py-16 text-center shadow-xs">
            <Heart className="mb-4 h-16 w-16 text-slate-300" />
            <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-900 uppercase">Your wishlist is empty</h2>
            <p className="mb-6 max-w-md text-slate-500 text-sm leading-relaxed px-4">
              Items added to your wishlist will be saved here. Start browsing our catalog and add your favorites!
            </p>
            <Button 
              size="lg" 
              onClick={() => router.push("/shop")}
              className="rounded-full px-8 bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md"
            >
              Explore Products
            </Button>
          </div>
        )}

        {/* Out of Stock Notice */}
        {wishlistItems.some(product => !product.inStock) && (
          <Alert className="mt-6 border-amber-500/20 bg-amber-50/50 rounded-2xl">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="font-bold text-amber-800">Some items are out of stock</AlertTitle>
            <AlertDescription className="text-amber-700 text-xs">
              One or more items in your wishlist are currently unavailable. We'll notify you when they're back in stock.
            </AlertDescription>
          </Alert>
        )}
      </motion.div>
    </div>
  )
}
