// @ts-nocheck
"use client"

import { createContext, useContext, useState, useEffect } from "react"

const CartContext = createContext<any>(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem("cart")
    if (storedCart) {
      setCartItems(JSON.parse(storedCart))
    }
    setLoading(false)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cart", JSON.stringify(cartItems))
    }
  }, [cartItems, loading])

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id)
      const availableStock = product.stock ?? Infinity

      if (existingItem) {
        const newQuantity = Math.min(existingItem.quantity + quantity, availableStock)
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: newQuantity } : item,
        )
      } else {
        const newQuantity = Math.min(quantity, availableStock)
        return [...prevItems, { ...product, quantity: newQuantity }]
      }
    })
  }

  const updateCartItemQuantity = (productId, quantity) => {
    setCartItems((prevItems) => prevItems.map((item) => {
      if (item.id === productId) {
        const availableStock = item.stock ?? Infinity
        return { ...item, quantity: Math.min(quantity, availableStock) }
      }
      return item
    }))
  }

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountedPrice ?? item.price;
      return total + price * item.quantity;
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        getCartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
