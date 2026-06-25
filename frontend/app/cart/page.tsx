// @ts-nocheck
"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Minus, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  CheckCircle,
  Sparkles,
  ChevronRight,
  CreditCard
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function CartPage() {
  const router = useRouter()
  const { cartItems, updateCartItemQuantity, removeFromCart, getCartTotal, clearCart } = useCart()
  const { toast } = useToast()
  
  // Checkout Modal states
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [orderInfo, setOrderInfo] = useState(null)
  const [waLink, setWaLink] = useState("")

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return
    updateCartItemQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId) => {
    removeFromCart(productId)
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
    })
  }

  const handleCheckout = () => {
    setIsCheckoutOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const subtotal = getCartTotal()
  const shipping = 0 // Free delivery for orders in Kenya currently
  const total = subtotal + shipping

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault()
    
    // Basic validations
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" })
      return
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      toast({ title: "Valid email is required", variant: "destructive" })
      return
    }
    if (!formData.phone.trim() || formData.phone.length < 9) {
      toast({ title: "Valid phone number is required", variant: "destructive" })
      return
    }
    if (!formData.address.trim()) {
      toast({ title: "Delivery address is required", variant: "destructive" })
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Submit the order to the database via API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            category: item.category || "General",
            description: item.description || ""
          }))
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong during checkout.")
      }

      // Order saved in DB successfully
      setOrderInfo(data.order)
      setIsSuccess(true)
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order is persisted. Please click 'Proceed to WhatsApp' to finalize delivery details.",
      })

      // 2. Generate WhatsApp redirect message
      const shortOrderId = data.order.id.slice(-8).toUpperCase()
      
      const whatsappMessage = `Hi Luxe Nest! 🛋️\n\n` +
        `I have just placed an order as a guest client:\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `*Order ID:* #${shortOrderId}\n` +
        `*Customer Name:* ${formData.name.trim()}\n` +
        `*Phone:* ${formData.phone.trim()}\n` +
        `*Delivery Address:* ${formData.address.trim()}\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `*Purchased Items:* \n` +
        cartItems.map(item => `• ${item.name} [x${item.quantity}] - Ksh ${(item.price * item.quantity).toLocaleString()}`).join("\n") +
        `\n\n` +
        `*Total Amount:* Ksh ${total.toLocaleString()}\n` +
        `*Payment Method:* M-Pesa Buy Goods Till\n\n` +
        `Please confirm my delivery details. Thank you! 🙏`

      // 3. Trigger WhatsApp redirection UI State
      const generatedWaLink = `https://wa.me/254769567516?text=${encodeURIComponent(whatsappMessage)}`
      setWaLink(generatedWaLink)
      
      // 4. Clear local cart
      clearCart()

    } catch (error) {
      console.error("Checkout Error:", error)
      toast({
        title: "Checkout Failed",
        description: error.message || "Please check your network and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (cartItems.length === 0 && !isSuccess) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <ShoppingBag className="mx-auto mb-6 h-16 w-16 text-muted-foreground" />
          <h1 className="mb-4 text-2xl font-bold">Your cart is empty</h1>
          <p className="mb-8 text-muted-foreground">Looks like you haven't added any products to your cart yet.</p>
          <Button asChild size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-white font-bold text-xs uppercase tracking-wider transition-all">
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Your Cart</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border">
            <div className="hidden border-b p-4 sm:grid sm:grid-cols-6">
              <div className="col-span-3 font-medium">Product</div>
              <div className="col-span-1 text-center font-medium">Price</div>
              <div className="col-span-1 text-center font-medium">Quantity</div>
              <div className="col-span-1 text-right font-medium">Total</div>
            </div>

            {cartItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 border-b p-4 sm:grid-cols-6"
              >
                {/* Product */}
                <div className="col-span-3 flex items-center">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="ml-4 flex flex-1 flex-col">
                    <Link href={`/shop/product/${item.id}`} className="font-medium hover:text-primary">
                      {item.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="mt-1 flex w-fit items-center text-xs text-destructive hover:underline sm:hidden"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-1 flex items-center justify-between sm:justify-center">
                  <span className="font-medium sm:hidden">Price:</span>
                  <span>Ksh {item.price.toLocaleString()}</span>
                </div>

                {/* Quantity */}
                <div className="col-span-1 flex items-center justify-between sm:justify-center">
                  <span className="font-medium sm:hidden">Quantity:</span>
                  <div className="flex items-center">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="mx-2 w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Total */}
                <div className="col-span-1 flex items-center justify-between sm:justify-end">
                  <span className="font-medium sm:hidden">Total:</span>
                  <span className="font-medium">Ksh {(item.price * item.quantity).toLocaleString()}</span>
                </div>

                {/* Remove Button (Desktop) */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="col-span-6 mt-2 hidden items-center justify-end text-xs text-destructive hover:underline sm:flex"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Ksh {subtotal.toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? <span className="text-green-600 font-bold uppercase">Free</span> : `Ksh ${shipping.toLocaleString()}`}</span>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Total</span>
                  <span>Ksh {total.toLocaleString()}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">Including VAT where applicable</p>
              </div>
            </div>

            <Button 
              onClick={handleCheckout} 
              className="mt-6 w-full gap-2 rounded-full bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-wider transition-all shadow-md h-12" 
              size="lg" 
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Checkout"}
              {!isSubmitting && <ArrowRight className="h-4 w-4" />}
            </Button>

            <div className="mt-4 text-center">
              <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          frictionless guest checkout dialog popup
         ============================================================ */}
      <Dialog open={isCheckoutOpen} onOpenChange={(open) => {
        setIsCheckoutOpen(open)
        if (!open) {
          setIsSuccess(false)
          setOrderInfo(null)
          setFormData({ name: "", email: "", phone: "", address: "" })
        }
      }}>
        <DialogContent className="sm:max-w-[550px] bg-white text-slate-900 border-slate-200 rounded-3xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto shadow-2xl">
          {isSuccess && orderInfo ? (
            <div className="text-center py-4 space-y-5">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
                <CheckCircle className="h-7 w-7 animate-bounce" />
              </div>
              
              <div className="space-y-1">
                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  ORDER #{(orderInfo.id || "").slice(-8).toUpperCase()} CREATED!
                </h2>
                <p className="text-slate-500 text-xs">
                  Your guest order has been securely persisted. Finalize your delivery on WhatsApp now.
                </p>
              </div>

              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-left space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold text-slate-700">{formData.name}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-semibold text-slate-700">{formData.phone}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Delivery Address:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[220px]">{formData.address}</span>
                </div>
                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-xs">
                  <span className="font-bold text-slate-500">Total KES:</span>
                  <span className="font-black text-slate-900">Ksh {total.toLocaleString()}</span>
                </div>
              </div>

              {/* M-Pesa Till details in success screen */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> M-Pesa Buy Goods Till
                </h4>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Till Number:</span>
                  <span className="font-black text-slate-900 text-base">000000</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Store Name:</span>
                  <span className="font-semibold text-slate-700">Luxe Nest</span>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <Button 
                  onClick={() => {
                    if (waLink) window.open(waLink, "_blank")
                  }}
                  className="w-full h-11 bg-[#25D366] hover:bg-[#20BA56] text-white font-black tracking-wide uppercase shadow-lg shadow-[#25D366]/20 transition-all text-xs gap-2 rounded-full border-0"
                >
                  <Phone className="h-4 w-4 fill-white shrink-0" />
                  Proceed to WhatsApp
                </Button>
                <Button 
                  onClick={() => {
                    setIsCheckoutOpen(false)
                    setIsSuccess(false)
                    setOrderInfo(null)
                    setFormData({ name: "", email: "", phone: "", address: "" })
                  }}
                  variant="outline"
                  className="w-full h-11 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs rounded-full"
                >
                  Close & Back to Shop
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <DialogHeader className="text-left space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-primary/10 border border-primary/20 text-primary w-fit">
                  <Sparkles className="h-3 w-3 text-primary/60" /> Frictionless Guest Checkout
                </span>
                <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Delivery details</DialogTitle>
                <DialogDescription className="text-slate-500 text-xs">
                  Provide your details to persist the order and open WhatsApp to arrange shipping.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-name" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="checkout-name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Arnold Kirui"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary/20 rounded-full text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-email" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="checkout-email"
                        name="email"
                        type="email"
                        required
                        placeholder="e.g. client@domain.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary/20 rounded-full text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="checkout-phone" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                      <Input
                        id="checkout-phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="e.g. +254 769 567 516"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary/20 rounded-full text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="checkout-address" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Delivery Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="checkout-address"
                      name="address"
                      type="text"
                      required
                      placeholder="e.g. Eldoret, Elgon View"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-primary/20 rounded-full text-xs"
                    />
                  </div>
                </div>

                {/* Subtotal, delivery fee, total breakdown */}
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Selected Items Total:</span>
                    <span className="font-semibold text-slate-700">Ksh {subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Delivery Charge:</span>
                    <span className="font-bold text-emerald-600">FREE</span>
                  </div>
                  <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
                    <span className="font-black text-slate-600 uppercase">Amount Due KES:</span>
                    <span className="font-black text-slate-900">Ksh {total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Instructions banner */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex gap-3 text-[11px] text-slate-600 items-start">
                  <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0 mt-0.5">!</div>
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900 uppercase tracking-wider text-[10px]">Payment via Secure M-Pesa Goods Till</p>
                    <p className="text-slate-500 leading-normal">
                      We will post the order to our database, and redirect you to WhatsApp. You can finalize payment to Till number <strong className="text-slate-900">000000</strong>.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-black tracking-wide text-xs rounded-full uppercase transition-all shadow-md border-0"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white" /> Persisting Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-1.5">
                        Confirm Order & Route to WhatsApp <ChevronRight className="h-4 w-4 text-white" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
