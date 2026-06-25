// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  ArrowLeft, 
  ShoppingCart, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  Loader2, 
  CheckCircle,
  Sparkles,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/components/ui/use-toast"

export default function CheckoutPage() {
  const router = useRouter()
  const { cartItems, getCartTotal, clearCart } = useCart()
  const { toast } = useToast()
  
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

  // Redirect if cart is empty and checkout hasn't succeeded yet
  useEffect(() => {
    if (cartItems.length === 0 && !isSuccess) {
      router.push("/shop")
    }
  }, [cartItems, isSuccess, router])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const subtotal = getCartTotal()
  const deliveryFee = 0 // Free delivery for orders in Kenya currently
  const total = subtotal + deliveryFee

  const handleSubmit = async (e) => {
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

  if (isSuccess && orderInfo) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100/40 via-slate-50 to-slate-50 -z-10" />
        <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-blue-500/5 blur-[120px] -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600">
            <CheckCircle className="h-8 w-8 animate-bounce" />
          </div>
          
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2">
            ORDER #{(orderInfo.id || "").slice(-8).toUpperCase()} CREATED!
          </h2>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Your guest order has been persisted successfully in our database. We are now redirecting you to WhatsApp to finalize your delivery.
          </p>

          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-6 text-left space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Guest Client:</span>
              <span className="font-semibold text-slate-700">{formData.name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Phone:</span>
              <span className="font-semibold text-slate-700">{formData.phone}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Address:</span>
              <span className="font-semibold text-slate-700 truncate max-w-[200px]">{formData.address}</span>
            </div>
            <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
              <span className="font-bold text-slate-500">Total KES:</span>
              <span className="font-black text-slate-900">Ksh {total.toLocaleString()}</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={() => {
                if (waLink) window.open(waLink, "_blank")
              }}
              className="w-full h-12 bg-[#25D366] hover:bg-[#20BA56] text-white font-black tracking-wide uppercase shadow-lg shadow-[#25D366]/20 transition-all text-sm gap-2 rounded-full"
            >
              <Phone className="h-4 w-4 fill-white shrink-0" />
              Proceed to WhatsApp
            </Button>
            <Button 
              onClick={() => router.push("/")}
              variant="outline"
              className="w-full h-12 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs rounded-full"
            >
              Return to Store
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100/60 via-slate-50 to-slate-50 -z-10" />
      <div className="absolute top-1/3 left-1/4 h-[500px] w-[500px] rounded-full bg-slate-500/5 blur-[150px] -z-10" />

      <div className="max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-8">
          <Link 
            href="/cart"
            className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Shopping Cart</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Column */}
          <div className="lg:col-span-7 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl"
            >
              <div className="mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 border border-slate-200 text-slate-600 mb-3">
                  <Sparkles className="h-3 w-3" /> Secure Guest Checkout
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 uppercase leading-none">
                  Delivery Details
                </h1>
                <p className="text-slate-500 text-sm mt-2">
                  No account registration required. Simply fill in your details to book your delivery.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. First Last"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. client@domain.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Phone Number (WhatsApp Active)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="e.g. +254 769 567 516"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full"
                    />
                  </div>
                  <p className="text-[10px] text-slate-500">We will use this to contact you for dispatch and load confirmation.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-600 font-semibold text-xs tracking-wider uppercase">Delivery Address / Pick Up Point</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      required
                      placeholder="e.g. Eldoret, Elgon View"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="pl-11 h-12 bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-black tracking-wide text-sm rounded-full uppercase transition-all shadow-md"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-white" /> Processing Order...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Place Order & Route to WhatsApp <ChevronRight className="h-4 w-4 text-white" />
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Cart Details Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Payment Coordinates */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-emerald-50 border border-emerald-100 rounded-3xl p-6 backdrop-blur-xl shadow-xl"
            >
              <h3 className="text-base font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-emerald-600" /> Payment instructions
              </h3>
              
              <div className="mt-4 space-y-4 text-sm">
                <p className="text-slate-500 text-xs leading-relaxed">
                  We process payments via secure **M-Pesa Buy Goods Till**. Follow these instructions to make payment:
                </p>
                
                <div className="bg-white rounded-2xl p-4 border border-emerald-100 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Payment Channel:</span>
                    <span className="font-bold text-emerald-600 uppercase">M-Pesa Buy Goods</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Till Number:</span>
                    <span className="font-black text-slate-900 text-base">000000</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 font-medium">Store Name:</span>
                    <span className="font-bold text-slate-700">Luxe Nest</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-[11px] text-slate-500">
                  <div className="h-4 w-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold shrink-0 mt-0.5">!</div>
                  <p>Order details will be immediately printed to the database, and you will finalize confirmation via WhatsApp immediately.</p>
                </div>
              </div>
            </motion.div>

            {/* Cart summary */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4"
            >
              <h3 className="text-base font-black tracking-tight text-slate-900 uppercase flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-slate-400" /> Order Summary
              </h3>

              <div className="divide-y divide-slate-100 max-h-[220px] overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-3 flex justify-between gap-4 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                      <p className="text-slate-500">{item.category} (x{item.quantity})</p>
                    </div>
                    <span className="font-semibold text-slate-900 shrink-0">
                      Ksh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-500">
                  <span>Cart Subtotal:</span>
                  <span className="font-semibold text-slate-900">Ksh {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="border-t border-slate-200 my-2 pt-3 flex justify-between text-sm">
                  <span className="font-black text-slate-600 uppercase">Total Amount:</span>
                  <span className="font-black text-slate-900 text-base">Ksh {total.toLocaleString()}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
