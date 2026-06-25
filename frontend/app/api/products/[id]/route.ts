// @ts-nocheck
import { NextResponse } from "next/server"

// ─── Same mock catalog used by /api/products ──────────────────────────────────
const MOCK_PRODUCTS = [
  { id: "pro-blender", name: "High-Speed Pro Blender", price: 25000, originalPrice: 32000, discount: "20%", image: "/featured/blender.png", category: { id: "cat-appliances", name: "Appliances", slug: "appliances" }, description: "Premium professional blender designed for ultimate performance and minimalist luxury in your kitchen.", inStock: true, rating: 4.8, featured: true, createdAt: new Date().toISOString() },
  { id: "modern-lamp", name: "Modern Kitchen Pendant", price: 12400, originalPrice: 14200, discount: "15%", image: "/featured/lamp.png", category: { id: "cat-lighting", name: "Lighting", slug: "lighting" }, description: "Sleek and modern pendant lamp providing warm, ambient lighting for dining and kitchen islands.", inStock: true, rating: 4.6, featured: true, createdAt: new Date().toISOString() },
  { id: "cutlery-set", name: "Minimalist Cutlery Set", price: 8500, originalPrice: 9800, discount: "15%", image: "/featured/cutlery.png", category: { id: "cat-cutlery", name: "Cutlery", slug: "cutlery" }, description: "Sturdy and beautifully crafted cutlery set, providing a timeless foundation for everyday dining.", inStock: true, rating: 4.7, featured: true, createdAt: new Date().toISOString() },
  { id: "stand-mixer", name: "Premium Stand Mixer", price: 45000, originalPrice: 55000, discount: "18%", image: "/featured/blender.png", category: { id: "cat-appliances", name: "Appliances", slug: "appliances" }, description: "Luxurious stand mixer that serves as the perfect centerpiece for baking enthusiasts.", inStock: true, rating: 4.9, featured: true, createdAt: new Date().toISOString() },
  { id: "ceramic-bowl-set", name: "Ceramic Bowl Set", price: 6200, originalPrice: 7500, discount: "17%", image: "/featured/cutlery.png", category: { id: "cat-utensils", name: "Utensils", slug: "utensils" }, description: "Handcrafted ceramic bowl set in earthy, warm tones. Perfect for everyday use.", inStock: true, rating: 4.5, featured: false, createdAt: new Date().toISOString() },
  { id: "bamboo-tray", name: "Bamboo Serving Tray", price: 3800, image: "/featured/cutlery.png", category: { id: "cat-utensils", name: "Utensils", slug: "utensils" }, description: "Eco-friendly bamboo tray, elegant and versatile for serving or displaying.", inStock: true, rating: 4.3, featured: false, createdAt: new Date().toISOString() },
  { id: "wicker-lamp", name: "Wicker Hanging Lamp", price: 9500, originalPrice: 19000, discount: "50%", image: "/featured/lamp.png", category: { id: "cat-lighting", name: "Lighting", slug: "lighting" }, description: "Natural wicker pendant light that adds warmth and texture to any living space.", inStock: true, rating: 4.4, featured: false, createdAt: new Date().toISOString() },
  { id: "brass-stand", name: "Brass-Legged Display Stand", price: 28000, originalPrice: 32900, discount: "15%", image: "/featured/blender.png", category: { id: "cat-decor", name: "Decor", slug: "decor" }, description: "Elegant display stand with solid brass legs, perfect for plants or decorative pieces.", inStock: true, rating: 4.6, featured: false, createdAt: new Date().toISOString() },
  { id: "marble-soap", name: "Marble Soap Dispenser", price: 4200, image: "/featured/blender.png", category: { id: "cat-bathroom", name: "Bathroom", slug: "bathroom" }, description: "Hand-carved marble soap dispenser adding luxury to any bathroom countertop.", inStock: true, rating: 4.2, featured: false, createdAt: new Date().toISOString() },
  { id: "linen-blanket", name: "Linen Throw Blanket", price: 5500, image: "/featured/blender.png", category: { id: "cat-bedroom", name: "Bedroom", slug: "bedroom" }, description: "Soft premium linen throw blanket in neutral tones for the modern bedroom.", inStock: true, rating: 4.7, featured: false, createdAt: new Date().toISOString() },
  { id: "rattan-basket", name: "Rattan Storage Basket", price: 2900, originalPrice: 3400, discount: "15%", image: "/featured/blender.png", category: { id: "cat-storage", name: "Storage", slug: "storage" }, description: "Hand-woven rattan basket for stylish and practical everyday storage.", inStock: true, rating: 4.1, featured: false, createdAt: new Date().toISOString() },
  { id: "wall-clock", name: "Minimalist Wall Clock", price: 4200, image: "/featured/blender.png", category: { id: "cat-decor", name: "Decor", slug: "decor" }, description: "Sleek minimal wall clock with a matte finish, perfect for any modern interior.", inStock: false, rating: 4.0, featured: false, createdAt: new Date().toISOString() },
  { id: "cast-iron-skillet", name: "Cast Iron Skillet", price: 8900, image: "/featured/blender.png", category: { id: "cat-kitchen", name: "Kitchen", slug: "kitchen" }, description: "Pre-seasoned cast iron skillet for even heat distribution and lasting durability.", inStock: true, rating: 4.8, featured: false, createdAt: new Date().toISOString() },
  { id: "scented-candle", name: "Soy Wax Scented Candle", price: 1500, image: "/featured/blender.png", category: { id: "cat-decor", name: "Decor", slug: "decor" }, description: "Hand-poured soy wax candle with calming botanical scents for your home.", inStock: true, rating: 4.4, featured: false, createdAt: new Date().toISOString() },
  { id: "steel-kettle", name: "Stainless Steel Kettle", price: 6200, image: "/featured/blender.png", category: { id: "cat-kitchen", name: "Kitchen", slug: "kitchen" }, description: "Brushed stainless steel kettle with ergonomic handle and gooseneck spout.", inStock: true, rating: 4.6, featured: false, createdAt: new Date().toISOString() },
  { id: "velvet-chair", name: "Velvet Accent Chair", price: 45000, originalPrice: 47300, discount: "5%", image: "/featured/blender.png", category: { id: "cat-living-room", name: "Living Room", slug: "living-room" }, description: "Luxurious velvet accent chair in muted sage green, perfect as a statement piece.", inStock: true, rating: 4.9, featured: false, createdAt: new Date().toISOString() },
  { id: "bamboo-organizer", name: "Bathroom Bamboo Organizer", price: 2100, image: "/featured/blender.png", category: { id: "cat-bathroom", name: "Bathroom", slug: "bathroom" }, description: "Multi-tier bamboo organizer to declutter your bathroom countertop elegantly.", inStock: true, rating: 4.2, featured: false, createdAt: new Date().toISOString() },
  { id: "linen-duvet", name: "Linen Duvet Cover", price: 12500, image: "/featured/blender.png", category: { id: "cat-bedroom", name: "Bedroom", slug: "bedroom" }, description: "Breathable 100% linen duvet cover in warm earth tones for restful sleep.", inStock: true, rating: 4.7, featured: false, createdAt: new Date().toISOString() },
  { id: "pour-over-set", name: "Ceramic Pour-Over Coffee Set", price: 7800, originalPrice: 8666, discount: "10%", image: "/featured/blender.png", category: { id: "cat-kitchen", name: "Kitchen", slug: "kitchen" }, description: "Handcrafted ceramic pour-over set for the coffee connoisseur in your home.", inStock: true, rating: 4.5, featured: false, createdAt: new Date().toISOString() },
  { id: "spice-rack", name: "Wooden Spice Rack", price: 3200, image: "/featured/blender.png", category: { id: "cat-kitchen", name: "Kitchen", slug: "kitchen" }, description: "Solid acacia wood spice rack with pull-out drawers for organized kitchen storage.", inStock: false, rating: 4.0, featured: false, createdAt: new Date().toISOString() },
]

export async function GET(request, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ error: "Product identifier is required" }, { status: 400 })
    }

    const product = MOCK_PRODUCTS.find(
      (p) => p.id === id || p.name.toLowerCase().replace(/\s+/g, "-") === id.toLowerCase()
    )

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ product }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30" },
    })
  } catch (error) {
    console.error("Error fetching single mock product:", error)
    return NextResponse.json({ error: "Failed to fetch product details" }, { status: 500 })
  }
}
