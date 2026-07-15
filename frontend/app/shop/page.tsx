// @ts-nocheck
"use client"

import { useState, useEffect, Suspense, useMemo } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Check,
  Loader2,
  LayoutGrid,
  List,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product-card"
import Pagination from "@/components/pagination"

/* PLACEHOLDER PRODUCTS REMOVED - USING API EXCLUSIVELY */

const PRICE_RANGES = [
  { label: "Under KES 2,000", value: "0-2000" },
  { label: "KES 2,000 – 5,000", value: "2000-5000" },
  { label: "KES 5,000 – 15,000", value: "5000-15000" },
  { label: "KES 15,000 – 30,000", value: "15000-30000" },
  { label: "Over KES 30,000", value: "30000-max" },
]

/* ─────────────────────────────────────────────────────────────────
   FILTER SIDEBAR COMPONENT
   ───────────────────────────────────────────────────────────────── */
function FilterSidebar({
  allCategories,
  activePrices,
  setActivePrices,
  activeCategories,
  setActiveCategories,
  stockFilter,
  setStockFilter,
}) {
  const [openSections, setOpenSections] = useState({
    categories: true,
    price: true,
    stock: true,
  })

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }))
  }

  const toggleCategory = (cat) => {
    setActiveCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    )
  }

  const togglePrice = (range) => {
    setActivePrices((prev) =>
      prev.includes(range) ? prev.filter((r) => r !== range) : [...prev, range]
    )
  }

  const clearAll = () => {
    setActiveCategories([])
    setActivePrices([])
    setStockFilter("all")
  }

  const hasFilters =
    activeCategories.length > 0 ||
    activePrices.length > 0 ||
    stockFilter !== "all"

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <h3 className="font-black text-slate-800 text-sm uppercase tracking-wider">
            Filters
          </h3>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-wider transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Categories ── */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Category
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              openSections.categories ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {openSections.categories && (
            <motion.div
              key="cats"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                {allCategories.length === 0 ? (
                  <p className="text-xs text-slate-400 py-2">
                    No categories yet
                  </p>
                ) : (
                  allCategories.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <div
                        onClick={() => toggleCategory(cat)}
                        className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                          activeCategories.includes(cat)
                            ? "bg-primary border-primary"
                            : "border-slate-300 group-hover:border-primary"
                        }`}
                      >
                        {activeCategories.includes(cat) && (
                          <Check className="h-2.5 w-2.5 text-white" />
                        )}
                      </div>
                      <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                        {cat}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-slate-100 mb-6" />

      {/* ── Price Range ── */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Price Range
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              openSections.price ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {openSections.price && (
            <motion.div
              key="prices"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                {PRICE_RANGES.map((range) => (
                  <label
                    key={range.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      onClick={() => togglePrice(range.value)}
                      className={`h-4 w-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                        activePrices.includes(range.value)
                          ? "bg-primary border-primary"
                          : "border-slate-300 group-hover:border-primary"
                      }`}
                    >
                      {activePrices.includes(range.value) && (
                        <Check className="h-2.5 w-2.5 text-white" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {range.label}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-slate-100 mb-6" />

      {/* ── Stock / Availability ── */}
      <div>
        <button
          onClick={() => toggleSection("stock")}
          className="flex items-center justify-between w-full mb-3"
        >
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
            Availability
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
              openSections.stock ? "rotate-180" : ""
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {openSections.stock && (
            <motion.div
              key="stock"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="space-y-2">
                {[
                  { label: "All Items", value: "all" },
                  { label: "In Stock", value: "in" },
                  { label: "Out of Stock", value: "out" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2.5 cursor-pointer group"
                  >
                    <div
                      onClick={() => setStockFilter(option.value)}
                      className={`h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                        stockFilter === option.value
                          ? "bg-primary border-primary"
                          : "border-slate-300 group-hover:border-primary"
                      }`}
                    >
                      {stockFilter === option.value && (
                        <div className="h-1.5 w-1.5 bg-white rounded-full" />
                      )}
                    </div>
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON CARD
   ───────────────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="h-[340px] animate-pulse rounded-2xl bg-slate-100 border border-slate-50" />
  )
}

/* ─────────────────────────────────────────────────────────────────
   MAIN SHOP PAGE CONTENT
   ───────────────────────────────────────────────────────────────── */
function ShopPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const categoriesParam = searchParams.get("categories")
  const searchParam = searchParams.get("search")

  const [apiProducts, setApiProducts] = useState([])
  const [apiLoading, setApiLoading] = useState(true)
  const [apiFailed, setApiFailed] = useState(false)

  const [searchQuery, setSearchQuery] = useState(searchParam || "")
  const [sortBy, setSortBy] = useState("featured")
  const [currentPage, setCurrentPage] = useState(1)
  const [activePrices, setActivePrices] = useState([])
  const [activeCategories, setActiveCategories] = useState(
    categoriesParam ? categoriesParam.split(",") : []
  )
  const [stockFilter, setStockFilter] = useState("all")
  const [viewMode, setViewMode] = useState("grid")

  // Sync URL parameters to state on navigation changes
  useEffect(() => {
    const q = searchParams.get("search")
    setSearchQuery(q || "")

    const cats = searchParams.get("categories")
    setActiveCategories(cats ? cats.split(",") : [])
  }, [searchParams])

  const PRODUCTS_PER_PAGE = 12

  /* ── Fetch from API ── */
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setApiLoading(true)
        setApiFailed(false)
        const res = await fetch("/api/products?limit=200")
        if (!res.ok) throw new Error("API error")
        const data = await res.json()
        if (!cancelled) setApiProducts(Array.isArray(data) ? data : (data.products || []))
      } catch {
        if (!cancelled) setApiFailed(true)
      } finally {
        if (!cancelled) setApiLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  /* ── Merged product list: API results only ── */
  const sourceProducts = useMemo(() => {
    if (apiLoading) return []
    return apiProducts.map((p) => ({
      ...p,
      originalPrice: p.price,
      price: p.discountedPrice || p.price,
      image: p.images?.[0]?.url || null,
      category:
        typeof p.category === "string"
          ? p.category
          : p.category?.name || "General",
      inStock: p.stock > 0,
      discount: p.discountPercent ? `${p.discountPercent}%` : null,
    }))
  }, [apiLoading, apiProducts])

  /* ── Unique categories derived from sourceProducts ── */
  const allCategories = useMemo(() => {
    return Array.from(
      new Set(sourceProducts.map((p) => p.category).filter(Boolean))
    ).sort()
  }, [sourceProducts])

  /* ── Filtered + sorted products ── */
  const filteredProducts = useMemo(() => {
    let result = [...sourceProducts]

    // 1. Category filter
    if (activeCategories.length > 0) {
      result = result.filter((p) => activeCategories.includes(p.category))
    }

    // 2. Price filter
    if (activePrices.length > 0) {
      result = result.filter((p) =>
        activePrices.some((range) => {
          const parts = range.split("-")
          const min = parseInt(parts[0], 10)
          const isMax = parts[1] === "max"
          const max = isMax ? Infinity : parseInt(parts[1], 10)
          return p.price >= min && p.price <= max
        })
      )
    }

    // 3. Stock filter
    if (stockFilter === "in") {
      result = result.filter((p) => p.inStock !== false)
    } else if (stockFilter === "out") {
      result = result.filter((p) => p.inStock === false)
    }

    // 4. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          (p.name || "").toLowerCase().includes(q) ||
          (p.category || "").toLowerCase().includes(q)
      )
    }

    // 5. Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        result.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        break
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""))
        break
      default:
        break
    }

    return result
  }, [sourceProducts, activeCategories, activePrices, stockFilter, searchQuery, sortBy])

  /* ── Reset to page 1 when filters change ── */
  useEffect(() => {
    setCurrentPage(1)
  }, [activeCategories, activePrices, stockFilter, searchQuery, sortBy])

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE)
  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  )

  const activeFilterCount =
    activeCategories.length +
    activePrices.length +
    (stockFilter !== "all" ? 1 : 0)

  const sidebarProps = {
    allCategories,
    activePrices,
    setActivePrices,
    activeCategories,
    setActiveCategories,
    stockFilter,
    setStockFilter,
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <ChevronRight className="h-3 w-3" />
          <span className="text-slate-700 font-medium">Shop</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">
          Our Collection
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Premium household essentials, curated for modern living.
        </p>
        {apiFailed && (
          <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            ⚠️ Showing sample products — database connection unavailable.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 shrink-0">
          <div className="sticky top-28">
            <FilterSidebar {...sidebarProps} />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Top Controls Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            {/* Search + Mobile Filter */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="search"
                  placeholder="Search products..."
                  className="w-full pl-9 pr-4 h-10 bg-white border border-slate-200 text-slate-800 placeholder-slate-400 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Filter Sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="lg:hidden gap-2 rounded-full border-slate-200 text-xs font-bold uppercase tracking-wider relative"
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] p-6">
                  <FilterSidebar {...sidebarProps} />
                </SheetContent>
              </Sheet>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-xs text-slate-400 hidden md:block">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1 ? "item" : "items"}
              </span>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[160px] rounded-full border-slate-200 text-xs font-medium h-10">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A → Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z → A</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="hidden md:flex items-center border border-slate-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid"
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-primary text-white"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  aria-label="List view"
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Tags */}
          <AnimatePresence>
            {activeFilterCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mb-5 overflow-hidden"
              >
                {activeCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full px-3 py-1 uppercase tracking-wide"
                  >
                    {cat}
                    <button
                      onClick={() =>
                        setActiveCategories((prev) =>
                          prev.filter((c) => c !== cat)
                        )
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {activePrices.map((range) => {
                  const label =
                    PRICE_RANGES.find((r) => r.value === range)?.label || range
                  return (
                    <span
                      key={range}
                      className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full px-3 py-1"
                    >
                      {label}
                      <button
                        onClick={() =>
                          setActivePrices((prev) =>
                            prev.filter((r) => r !== range)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  )
                })}
                {stockFilter !== "all" && (
                  <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-bold rounded-full px-3 py-1 capitalize">
                    {stockFilter === "in" ? "In Stock" : "Out of Stock"}
                    <button onClick={() => setStockFilter("all")}>
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products Grid / Skeleton / Empty */}
          {apiLoading ? (
            <div
              className={`grid gap-5 ${
                viewMode === "grid"
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="my-20 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-black text-slate-800 mb-2">
                No products found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setActiveCategories([])
                  setActivePrices([])
                  setStockFilter("all")
                  setSearchQuery("")
                }}
                className="mt-4 text-sm font-bold text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div
                className={`grid gap-5 ${
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-1"
                }`}
              >
                {currentProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.04 }}
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────────
   ROOT EXPORT — Suspense wrapper required for useSearchParams
   ───────────────────────────────────────────────────────────────── */
export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-slate-500 font-medium">
              Loading shop...
            </p>
          </div>
        </div>
      }
    >
      <ShopPageContent />
    </Suspense>
  )
}
