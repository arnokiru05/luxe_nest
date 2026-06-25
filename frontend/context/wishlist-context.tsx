// @ts-nocheck
"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

const WishlistContext = createContext<any>(null)

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([])
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  // Load wishlist from local storage on mount
  useEffect(() => {
    setIsMounted(true)
    const storedWishlist = localStorage.getItem("luxenest_wishlist")
    if (storedWishlist) {
      try {
        setWishlistItems(JSON.parse(storedWishlist))
      } catch (error) {
        console.error("Failed to parse wishlist from local storage", error)
      }
    }
  }, [])

  // Save wishlist to local storage whenever it changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("luxenest_wishlist", JSON.stringify(wishlistItems))
    }
  }, [wishlistItems, isMounted])

  const addToWishlist = (product) => {
    setWishlistItems((prevItems) => {
      // Check if product is already in wishlist
      const exists = prevItems.some((item) => item.id === product.id)
      if (exists) {
        toast({
          title: "Already in Wishlist",
          description: `${product.name} is already in your wishlist.`,
        })
        return prevItems
      }
      
      toast({
        title: "Added to Wishlist",
        description: `${product.name} has been added to your wishlist.`,
      })
      return [...prevItems, product]
    })
  }

  const removeFromWishlist = (productId) => {
    setWishlistItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    toast({
      title: "Removed from Wishlist",
      description: "Item has been removed from your wishlist.",
    })
  }

  const clearWishlist = () => {
    setWishlistItems([])
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.id === productId)
  }

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
