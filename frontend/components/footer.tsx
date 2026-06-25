// @ts-nocheck
import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function Footer() {
  return (
    <div className="w-full">
    <footer className="w-full" style={{ background: "linear-gradient(135deg, #4A3728 0%, #3A2A1E 60%, #2D2018 100%)", color: "#FAF7F2" }}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info with Logo */}
          <div>
            <div className="mb-4">
              <Image src="/logo.png" alt="Luxe Nest Households" width={140} height={70} className="h-14 w-auto object-contain brightness-110" />
            </div>
            <p className="mt-4 max-w-xs text-sm" style={{ color: "rgba(250,247,242,0.75)" }}>
              Your trusted source for premium household essentials. We provide curated goods to elevate your living space.
            </p>
            <div className="mt-6 flex space-x-4">
              <a
                href="#"
                className="rounded-full p-2 transition-colors"
                style={{ background: "rgba(250,247,242,0.1)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(191,150,48,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(250,247,242,0.1)"}
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full p-2 transition-colors"
                style={{ background: "rgba(250,247,242,0.1)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(191,150,48,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(250,247,242,0.1)"}
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="rounded-full p-2 transition-colors"
                style={{ background: "rgba(250,247,242,0.1)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(191,150,48,0.3)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(250,247,242,0.1)"}
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "#BF9630" }}>Quick Links</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(250,247,242,0.75)" }}>
                  Home
                </Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(250,247,242,0.75)" }}>
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(250,247,242,0.75)" }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(250,247,242,0.75)" }}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm transition-colors hover:text-white" style={{ color: "rgba(250,247,242,0.75)" }}>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "#BF9630" }}>Contact Us</h3>
            <ul className="mt-4 space-y-3">
              <li className="flex items-start">
                <MapPin className="mr-2 h-5 w-5 shrink-0" style={{ color: "#8FAF7E" }} />
                <span className="text-sm" style={{ color: "rgba(250,247,242,0.75)" }}>Stowburg, 1st floor, Room 216, Eldoret, Kenya</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-5 w-5 shrink-0" style={{ color: "#BF9630" }} />
                <a 
                  href="tel:+254769567516" 
                  className="text-sm font-medium transition-colors hover:text-white"
                  style={{ color: "rgba(250,247,242,0.9)" }}
                >
                  +254 769 567 516
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-5 w-5 shrink-0" style={{ color: "#BF9630" }} />
                <a
                  href="mailto:sales@luxenest.com"
                  className="text-sm transition-colors hover:text-white"
                  style={{ color: "rgba(250,247,242,0.75)" }}
                >
                  sales@luxenest.com
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold" style={{ color: "#BF9630" }}>Newsletter</h3>
            <p className="mt-4 text-sm" style={{ color: "rgba(250,247,242,0.75)" }}>
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className="mt-4 flex">
              <Input
                type="email"
                placeholder="Your email"
                className="h-10 w-full rounded-l-md rounded-r-none border-r-0 text-white placeholder-white/50 focus:ring-0"
                style={{ background: "rgba(250,247,242,0.1)", borderColor: "rgba(250,247,242,0.2)" }}
                required
              />
              <Button
                type="submit"
                className="rounded-l-none rounded-r-md text-white hover:opacity-90"
                style={{ background: "#BF9630" }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 text-center" style={{ borderTop: "1px solid rgba(250,247,242,0.15)" }}>
          <p className="text-sm" style={{ color: "rgba(250,247,242,0.5)" }}>
            &copy; {new Date().getFullYear()} Luxe Nest Households. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
    </div>
  )
}
