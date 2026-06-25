// @ts-nocheck
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Filter, ChevronDown, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const CATEGORIES = [
  "Living Room",
  "Bedroom",
  "Kitchen & Dining",
  "Bathroom",
  "Home Decor",
  "Lighting",
  "Storage & Organisation",
  "Outdoor & Garden",
  "Home Office",
  "Textiles & Rugs",
]

const PRICE_RANGES = [
  { label: "Under Ksh 5,000", value: "0-5000" },
  { label: "Ksh 5,000 - Ksh 15,000", value: "5000-15000" },
  { label: "Ksh 15,000 - Ksh 30,000", value: "15000-30000" },
  { label: "Ksh 30,000 - Ksh 50,000", value: "30000-50000" },
  { label: "Ksh 50,000 - Ksh 100,000", value: "50000-100000" },
  { label: "Over Ksh 100,000", value: "100000-max" },
]

export default function CategorySidebar({ products = [] }) {
  const router = useRouter()
  const pathname = usePathname()

  const [categoriesOpen, setCategoriesOpen] = useState(true)
  const [priceOpen, setPriceOpen] = useState(true)
  const [availabilityOpen, setAvailabilityOpen] = useState(true)

  // Local state for filters to avoid immediate URL updates while typing/clicking quickly
  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedPrices, setSelectedPrices] = useState([])
  const [inStockOnly, setInStockOnly] = useState(false)
  const [outOfStockOnly, setOutOfStockOnly] = useState(false)

  // Sync local state with URL search params on mount and when URL changes
  useEffect(() => {
    const cats = searchParams.get("categories")?.split(",") || []
    const prices = searchParams.get("prices")?.split(",") || []
    const stock = searchParams.get("stock")

    setSelectedCategories(cats.filter(Boolean))
    setSelectedPrices(prices.filter(Boolean))
    setInStockOnly(stock === "in")
    setOutOfStockOnly(stock === "out")
  }, [searchParams])

  // Create query string
  const createQueryString = useCallback(
    (name, value) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      // Reset to page 1 on filter change
      params.delete("page")
      return params.toString()
    },
    [searchParams]
  )

  // Apply filters to URL
  const applyFilters = (updates) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Process updates
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        params.delete(key)
      } else if (Array.isArray(val)) {
        params.set(key, val.join(","))
      } else {
        params.set(key, val)
      }
    })

    // Delete old legacy 'category' param if we're now using 'categories' array
    if (updates.categories !== undefined) {
      params.delete("category")
    }

    params.delete("page")
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleCategoryChange = (category, checked) => {
    const updated = checked 
      ? [...selectedCategories, category] 
      : selectedCategories.filter(c => c !== category)
    applyFilters({ categories: updated })
  }

  const handlePriceChange = (priceValue, checked) => {
    const updated = checked 
      ? [...selectedPrices, priceValue] 
      : selectedPrices.filter(p => p !== priceValue)
    applyFilters({ prices: updated })
  }

  const handleStockChange = (type, checked) => {
    let stockVal = null
    if (type === "in") {
      if (checked) stockVal = "in"
      else if (outOfStockOnly) stockVal = "out"
    } else if (type === "out") {
      if (checked) stockVal = "out"
      else if (inStockOnly) stockVal = "in"
    }
    
    // Logic: if both checked, maybe clear stock filter (meaning ALL). 
    // But since they are checkboxes, let's strictly follow the last action.
    if (type === "in" && checked && outOfStockOnly) {
      stockVal = null; // show both
    }
    if (type === "out" && checked && inStockOnly) {
      stockVal = null; // show both
    }

    applyFilters({ stock: stockVal })
  }

  const clearFilters = () => {
    router.push(pathname, { scroll: false })
  }

  const hasActiveFilters = selectedCategories.length > 0 || selectedPrices.length > 0 || inStockOnly || outOfStockOnly || searchParams.has("search")

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
          <Filter className="h-4 w-4" />
          <span>Filters</span>
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="h-8 px-2 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
          >
            Clear All
          </Button>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6 custom-scrollbar">
        
        {/* Categories Section */}
        <Collapsible open={categoriesOpen} onOpenChange={setCategoriesOpen} className="space-y-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors">
            Categories
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${categoriesOpen ? "rotate-180 text-blue-600" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2.5 pt-1 pb-2">
            {CATEGORIES.map((category) => {
              const count = products.filter(p => {
                const prodCat = typeof p.category === 'string' ? p.category : p.category?.name;
                return prodCat === category;
              }).length;
              return (
                <div key={category} className="flex items-center space-x-3 group">
                  <Checkbox 
                    id={`cat-${category}`} 
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => handleCategoryChange(category, checked)}
                    className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <label 
                    htmlFor={`cat-${category}`}
                    className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors flex justify-between items-center"
                  >
                    <span>{category}</span>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-slate-500 font-bold">
                      {count}
                    </span>
                  </label>
                </div>
              );
            })}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* Price Ranges Section */}
        <Collapsible open={priceOpen} onOpenChange={setPriceOpen} className="space-y-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors">
            Price Range
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${priceOpen ? "rotate-180 text-blue-600" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2.5 pt-1 pb-2">
            {PRICE_RANGES.map((range) => (
              <div key={range.value} className="flex items-center space-x-3 group">
                <Checkbox 
                  id={`price-${range.value}`} 
                  checked={selectedPrices.includes(range.value)}
                  onCheckedChange={(checked) => handlePriceChange(range.value, checked)}
                  className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
                <label 
                  htmlFor={`price-${range.value}`}
                  className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors"
                >
                  {range.label}
                </label>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>

        <Separator className="bg-slate-100 dark:bg-slate-800" />

        {/* Availability Section */}
        <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen} className="space-y-3">
          <CollapsibleTrigger className="flex w-full items-center justify-between text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-blue-600 transition-colors">
            Availability
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${availabilityOpen ? "rotate-180 text-blue-600" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2.5 pt-1 pb-2">
            <div className="flex items-center space-x-3 group">
              <Checkbox 
                id="stock-in" 
                checked={inStockOnly}
                onCheckedChange={(checked) => handleStockChange("in", checked)}
                className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
              />
              <label 
                htmlFor="stock-in"
                className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors"
              >
                In Stock
              </label>
            </div>
            <div className="flex items-center space-x-3 group">
              <Checkbox 
                id="stock-out" 
                checked={outOfStockOnly}
                onCheckedChange={(checked) => handleStockChange("out", checked)}
                className="border-slate-300 dark:border-slate-700 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
              />
              <label 
                htmlFor="stock-out"
                className="text-sm text-slate-600 dark:text-slate-400 font-medium cursor-pointer flex-1 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors"
              >
                Out of Stock
              </label>
            </div>
          </CollapsibleContent>
        </Collapsible>

      </div>
    </div>
  )
}
