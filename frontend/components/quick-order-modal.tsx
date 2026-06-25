// @ts-nocheck
"use client"

import { useState } from "react"
import Image from "next/image"
import { 
  Minus, 
  Plus, 
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

export default function QuickOrderModal({ product, isOpen, onClose }) {
  const { toast } = useToast()
  const [quantity, setQuantity] = useState(1)
  
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

  if (!product) return null

  const handleQuantityChange = (delta) => {
    setQuantity(prev => {
      const newQty = prev + delta
      return newQty < 1 ? 1 : newQty
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setIsSuccess(false)
    setOrderInfo(null)
    setWaLink("")
    setQuantity(1)
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  const handleClose = () => {
    onClose()
    setTimeout(handleReset, 300) // Reset after animation
  }

  const totalAmount = product.price * quantity

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return toast({ title: "Name is required", variant: "destructive" })
    if (!formData.email.trim() || !formData.email.includes("@")) return toast({ title: "Valid email required", variant: "destructive" })
    if (!formData.phone.trim() || formData.phone.length < 9) return toast({ title: "Valid phone required", variant: "destructive" })
    if (!formData.address.trim()) return toast({ title: "Delivery address required", variant: "destructive" })

    setIsSubmitting(true)

    try {
      // 1. Submit the order to the database via API
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          items: [{
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            category: product.category || "General Parts",
            description: product.description || ""
          }]
        })
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Something went wrong during checkout.")

      // Order saved in DB successfully
      setOrderInfo(data.order)
      setIsSuccess(true)
      
      toast({
        title: "Order Placed Successfully!",
        description: "Your order is persisted. Please click 'Proceed to WhatsApp' to finalize.",
      })

      // 2. Generate WhatsApp redirect message
      const shortOrderId = data.order.id.slice(-8).toUpperCase()
      const whatsappMessage = `Hi Luxe Nest! 🏡\n\n` +
        `I have just placed an order via Quick Buy:\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `*Order ID:* #${shortOrderId}\n` +
        `*Customer Name:* ${formData.name.trim()}\n` +
        `*Phone:* ${formData.phone.trim()}\n` +
        `*Delivery Address:* ${formData.address.trim()}\n` +
        `━━━━━━━━━━━━━━━━━━━\n\n` +
        `*Purchased Item:* \n` +
        `• ${product.name} [x${quantity}] - Ksh ${totalAmount.toLocaleString()}\n\n` +
        `*Total Amount:* Ksh ${totalAmount.toLocaleString()}\n` +
        `*Payment Method:* M-Pesa Buy Goods Till\n\n` +
        `Please confirm my delivery details. Thank you! 🙏`

      const generatedWaLink = `https://wa.me/254769567516?text=${encodeURIComponent(whatsappMessage)}`
      setWaLink(generatedWaLink)

    } catch (error) {
      console.error("Quick Order Error:", error)
      toast({
        title: "Order Failed",
        description: error.message || "Please check your network and try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
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
                <span className="text-slate-500">Item:</span>
                <span className="font-semibold text-slate-700">{product.name} (x{quantity})</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Name:</span>
                <span className="font-semibold text-slate-700">{formData.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-700">{formData.phone}</span>
              </div>
              <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-xs">
                <span className="font-bold text-slate-500">Total KES:</span>
                <span className="font-black text-slate-900">Ksh {totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <Button 
                onClick={() => waLink && window.open(waLink, "_blank")}
                className="w-full h-11 bg-[#25D366] hover:bg-[#20BA56] text-white font-black tracking-wide uppercase shadow-lg shadow-[#25D366]/20 transition-all text-xs gap-2 rounded-full border-0"
              >
                <Phone className="h-4 w-4 fill-white shrink-0" />
                Proceed to WhatsApp
              </Button>
              <Button 
                onClick={handleClose}
                variant="outline"
                className="w-full h-11 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold uppercase tracking-wider text-xs rounded-full"
              >
                Close & Continue Shopping
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DialogHeader className="text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-slate-100 border border-slate-200 text-slate-600 w-fit">
                <Sparkles className="h-3 w-3 text-slate-400" /> Quick Order
              </span>
              <DialogTitle className="text-xl font-black text-slate-900 uppercase tracking-tight">Buy Now</DialogTitle>
              <DialogDescription className="text-slate-500 text-xs">
                Provide your details to order this item immediately.
              </DialogDescription>
            </DialogHeader>

            {/* Product Summary & Quantity Selector */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-3 flex items-center gap-4">
              <div className="relative h-16 w-16 bg-white rounded-xl border border-slate-100 overflow-hidden shrink-0">
                <Image src={product.image || "/featured/blender.png"} alt={product.name} fill className="object-contain" />
              </div>
              <div className="flex-1 space-y-1">
                <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product.name}</h4>
                <p className="text-slate-500 text-xs font-semibold">Ksh {product.price.toLocaleString()}</p>
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-full h-9 p-1 shrink-0">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                  onClick={() => handleQuantityChange(-1)} 
                  disabled={quantity <= 1}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-8 text-center text-xs font-bold text-slate-900">{quantity}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100" 
                  onClick={() => handleQuantityChange(1)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="quick-name" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="quick-name" name="name" type="text" required placeholder="e.g. First Last"
                    value={formData.name} onChange={handleInputChange}
                    className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quick-email" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="quick-email" name="email" type="email" required placeholder="e.g. client@domain.com"
                      value={formData.email} onChange={handleInputChange}
                      className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="quick-phone" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="quick-phone" name="phone" type="tel" required placeholder="e.g. +254 769 567 516"
                      value={formData.phone} onChange={handleInputChange}
                      className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quick-address" className="text-slate-600 font-bold text-[10px] tracking-wider uppercase">Delivery Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="quick-address" name="address" type="text" required placeholder="e.g. Eldoret, Elgon View"
                    value={formData.address} onChange={handleInputChange}
                    className="pl-11 h-11 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-slate-300 focus:ring-slate-300 rounded-full text-xs"
                  />
                </div>
              </div>

              {/* Total breakdown */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-1 text-xs mt-2">
                <div className="flex justify-between text-slate-500">
                  <span>Items Total:</span>
                  <span className="font-semibold text-slate-700">Ksh {totalAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-slate-200 my-2 pt-2 flex justify-between text-sm">
                  <span className="font-black text-slate-600 uppercase">Amount Due KES:</span>
                  <span className="font-black text-slate-900">Ksh {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-black tracking-wide text-xs rounded-full uppercase transition-all shadow-md border-0"
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
  )
}
