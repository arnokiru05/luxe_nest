// @ts-nocheck
"use client"

import React from "react"

// ============================================================
// HIGH-FIDELITY VECTOR EMBL-SVG DESIGNS FOR HOME BRANDS
// ============================================================

const SmegLogo = () => (
  <svg className="h-9 w-auto object-contain" viewBox="0 0 140 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="20" y="28" fontFamily="'Arial Black', Helvetica, sans-serif" fontWeight="900" fontSize="28" letterSpacing="0.15em" fill="#1E293B">
      SMEG
    </text>
  </svg>
)

const DysonLogo = () => (
  <svg className="h-9 w-auto object-contain" viewBox="0 0 140 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="20" y="26" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="24" letterSpacing="0.05em" fill="#1E293B">
      dyson
    </text>
  </svg>
)

const KitchenAidLogo = () => (
  <svg className="h-9 w-auto object-contain" viewBox="0 0 160 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="10" y="26" fontFamily="Georgia, Times, serif" fontWeight="900" fontSize="22" letterSpacing="0.02em" fill="#1E293B" fontStyle="italic">
      KitchenAid
    </text>
  </svg>
)

const PhilipsLogo = () => (
  <svg className="h-9 w-auto object-contain" viewBox="0 0 140 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="15" y="26" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.1em" fill="#0B4D97">
      PHILIPS
    </text>
  </svg>
)

const LgLogo = () => (
  <svg className="h-9 w-auto object-contain" viewBox="0 0 140 38" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="19" r="14" fill="#A50034" />
    <path d="M18 19L18 12M18 19L24 19" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="1.5" fill="white" />
    <text x="42" y="26" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="22" letterSpacing="0.05em" fill="#1E293B">
      LG
    </text>
  </svg>
)

// ============================================================
// BRAND SCROLLER CONTAINER COMPONENT (INFINITE CAROUSEL)
// ============================================================

export default function BrandScroller() {
  const brands = [
    { name: "SMEG", logo: <SmegLogo /> },
    { name: "Dyson", logo: <DysonLogo /> },
    { name: "KitchenAid", logo: <KitchenAidLogo /> },
    { name: "Philips", logo: <PhilipsLogo /> },
    { name: "LG", logo: <LgLogo /> },
  ]

  // Quadruple the items to ensure seamless wrapping without empty gaps on large monitors
  const duplicatedBrands = [...brands, ...brands, ...brands, ...brands]

  return (
    <div className="w-full bg-slate-50/50 py-10 border-t border-b border-slate-100 overflow-hidden">
      
      {/* Title Header */}
      <div className="mx-auto w-full max-w-7xl px-4 text-center mb-8">
        <span className="text-[10px] font-black tracking-[0.25em] text-slate-400 uppercase leading-none block">
          Featured Premium Brands
        </span>
      </div>

      {/* Infinite Scroll Wrapper Container */}
      <div className="relative w-full flex overflow-x-hidden py-2 select-none">
        
        {/* Animated Marquee Strip */}
        <div className="flex animate-marquee-custom shrink-0 items-center justify-around">
          {duplicatedBrands.map((brand, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-center grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-300 transform hover:scale-105 shrink-0 mx-6 md:mx-10 cursor-pointer"
            >
              {brand.logo}
            </div>
          ))}
        </div>

        {/* CSS Embedded Animation Rules */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes marquee-scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(-50%);
              }
            }
            .animate-marquee-custom {
              display: flex;
              width: max-content;
              animation: marquee-scroll 32s linear infinite;
            }
            .animate-marquee-custom:hover {
              animation-play-state: paused;
            }
          `
        }} />
        
      </div>
    </div>
  )
}
