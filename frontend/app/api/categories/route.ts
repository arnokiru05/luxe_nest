// @ts-nocheck
import { NextResponse } from "next/server"

// ─── Mock categories for frontend demo ───────────────────────────────────────
const MOCK_CATEGORIES = [
  { id: "cat-appliances",  name: "Appliances",  slug: "appliances",  image: null, _count: { products: 4 } },
  { id: "cat-lighting",    name: "Lighting",    slug: "lighting",    image: null, _count: { products: 3 } },
  { id: "cat-cutlery",     name: "Cutlery",     slug: "cutlery",     image: null, _count: { products: 2 } },
  { id: "cat-utensils",    name: "Utensils",    slug: "utensils",    image: null, _count: { products: 3 } },
  { id: "cat-decor",       name: "Decor",       slug: "decor",       image: null, _count: { products: 4 } },
  { id: "cat-kitchen",     name: "Kitchen",     slug: "kitchen",     image: null, _count: { products: 5 } },
  { id: "cat-bedroom",     name: "Bedroom",     slug: "bedroom",     image: null, _count: { products: 3 } },
  { id: "cat-bathroom",    name: "Bathroom",    slug: "bathroom",    image: null, _count: { products: 2 } },
  { id: "cat-living-room", name: "Living Room", slug: "living-room", image: null, _count: { products: 2 } },
  { id: "cat-storage",     name: "Storage",     slug: "storage",     image: null, _count: { products: 2 } },
]

export async function GET() {
  return NextResponse.json(
    { categories: MOCK_CATEGORIES },
    {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    }
  )
}
