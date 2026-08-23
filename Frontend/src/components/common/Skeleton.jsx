import React from 'react'

/**
 * Base Skeleton component with rich shimmering animation and dark-mode support.
 */
export const Skeleton = ({ className = '', rounded = 'rounded-[4px]', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-[#ECEAE6] dark:bg-[#222222] ${rounded} ${className}`}
      {...props}
    />
  )
}

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. BUYER SKELETONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Product Card Skeleton (Used in Home, AllProducts, NewArrivals, Related Products)
export const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`flex flex-col ${className}`}>
    <div className="relative aspect-[3/4] overflow-hidden bg-[#F0EEEA] dark:bg-[#1A1A1A] rounded-sm mb-2.5 animate-pulse border border-[#EAEAEA] dark:border-[#2A2A2A]">
      <Skeleton className="w-full h-full" rounded="rounded-none" />
    </div>
    <Skeleton className="h-2.5 w-1/3 mb-1.5" />
    <Skeleton className="h-3.5 w-3/4 mb-1.5" />
    <Skeleton className="h-3.5 w-1/4" />
  </div>
)

export const ProductGridSkeleton = ({ count = 10, cols = 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5' }) => (
  <div className={`grid ${cols} gap-4 md:gap-5`}>
    {Array.from({ length: count }).map((_, i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </div>
)

// Single Product Page Skeleton
export const SingleProductSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-[#111111] dark:text-[#E5E2E1] pb-24 md:pb-12">
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-4 md:py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Main Product Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_420px] gap-6 lg:gap-10">
        {/* Thumbnails Rail (Desktop) */}
        <div className="hidden lg:flex flex-col gap-2.5 w-16 shrink-0">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full" rounded="rounded" />
          ))}
        </div>

        {/* Main Hero Image */}
        <div className="relative">
          <Skeleton className="aspect-[3/4] max-h-[580px] w-full" rounded="rounded-[8px]" />
          {/* Mobile Thumbnails */}
          <div className="lg:hidden flex gap-2 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-14 h-18 shrink-0" rounded="rounded" />
            ))}
          </div>
        </div>

        {/* Product Details Panel */}
        <div className="space-y-4">
          <div>
            <Skeleton className="h-3.5 w-20 mb-2" />
            <Skeleton className="h-7 w-4/5 mb-3" />
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-baseline gap-3 mb-4">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-36" />
          </div>

          {/* Color Selector Skeleton */}
          <div className="pt-2 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-16" rounded="rounded" />
              <Skeleton className="h-8 w-16" rounded="rounded" />
              <Skeleton className="h-8 w-16" rounded="rounded" />
            </div>
          </div>

          {/* Size Selector Skeleton */}
          <div className="pt-2 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="flex gap-2">
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <Skeleton key={s} className="h-10 w-12" rounded="rounded" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="hidden md:grid grid-cols-2 gap-3 pt-4">
            <Skeleton className="h-12 w-full" rounded="rounded-lg" />
            <Skeleton className="h-12 w-full" rounded="rounded-lg" />
          </div>

          {/* Accordion Skeletons */}
          <div className="pt-4 border-t border-[#EAEAEA] dark:border-[#2A2A2A] space-y-3">
            <div className="py-3 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
              <Skeleton className="h-4 w-40 mb-2" />
              <Skeleton className="h-3 w-full mb-1" />
              <Skeleton className="h-3 w-3/4" />
            </div>
            <div className="py-3 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Shopping Bag / Cart Skeleton
export const CartSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-[#111111] dark:text-[#E5E2E1]">
    <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-6">
      {/* Title */}
      <div className="mb-6 flex items-baseline justify-between border-b border-[#EAEAEA] dark:border-[#2A2A2A] pb-3">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start w-full">
        {/* Left: Cart Items */}
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" rounded="rounded-[6px]" />

          <div className="divide-y divide-[#EAEAEA] dark:divide-[#2A2A2A]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 py-5 items-start">
                <Skeleton className="w-20 h-24 sm:w-24 sm:h-28 shrink-0" rounded="rounded-[6px]" />
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between">
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex gap-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-5" />
                  </div>
                  <div className="flex justify-between items-end pt-3">
                    <Skeleton className="h-8 w-24" rounded="rounded" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#EAEAEA] dark:border-[#2A2A2A]">
            <Skeleton className="h-16 w-full" rounded="rounded" />
            <Skeleton className="h-16 w-full" rounded="rounded" />
            <Skeleton className="h-16 w-full" rounded="rounded" />
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 space-y-4">
          <Skeleton className="h-4 w-36 pb-2" />
          <div className="space-y-2.5 py-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-14" />
            </div>
          </div>
          <div className="flex justify-between py-3 border-t border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-12 w-full" rounded="rounded" />
          <Skeleton className="h-3 w-48 mx-auto" />
        </div>
      </div>
    </div>
  </div>
)

// Wishlist Skeleton
export const WishlistSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-[#111111] dark:text-[#E5E2E1] pb-16">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>

    <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6">
      <div className="mb-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] pb-3 flex justify-between">
        <div className="space-y-1">
          <Skeleton className="h-7 w-36" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[3px] p-3 space-y-2">
            <Skeleton className="aspect-[3/4] w-full" rounded="rounded-sm" />
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-9 w-full mt-2" rounded="rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Address Selection Page Skeleton
export const AddressSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    {/* Stepper */}
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>

    <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6">
      <div className="mb-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] pb-3 flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-9 w-32" rounded="rounded" />
      </div>

      {/* Address Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 rounded-[8px] border border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] space-y-2.5">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <Skeleton className="w-4 h-4" rounded="rounded-full" />
                <Skeleton className="h-4 w-14" rounded="rounded" />
              </div>
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>
        ))}
      </div>

      {/* Action Footer */}
      <div className="p-5 bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-40" />
        </div>
        <Skeleton className="h-11 w-56" rounded="rounded" />
      </div>
    </div>
  </div>
)

// Order Summary Skeleton
export const OrderSummarySkeleton = () => (
  <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0e0e0e] pb-20">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-white dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>

    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6">
      <div className="mb-6 space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3.5 w-64" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-5">
          {/* Address card */}
          <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-5 space-y-3">
            <Skeleton className="h-4 w-32 pb-2" />
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-full" />
            <Skeleton className="h-3.5 w-2/3" />
          </div>

          {/* Items review */}
          <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-5 space-y-4">
            <Skeleton className="h-4 w-36 pb-2" />
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-4 py-3 border-b border-[#F0F0F0] dark:border-[#252525] last:border-0">
                <Skeleton className="w-16 h-20 shrink-0" rounded="rounded-[6px]" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3">
            <Skeleton className="h-20 w-full" rounded="rounded-[10px]" />
            <Skeleton className="h-20 w-full" rounded="rounded-[10px]" />
            <Skeleton className="h-20 w-full" rounded="rounded-[10px]" />
          </div>
        </div>

        {/* Right price sidebar */}
        <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-5 space-y-4">
          <Skeleton className="h-4 w-32 pb-2" />
          <div className="space-y-3">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          <div className="flex justify-between py-4 border-t border-b border-[#F0F0F0] dark:border-[#252525]">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-6 w-24" />
          </div>
          <Skeleton className="h-14 w-full" rounded="rounded-[8px]" />
        </div>
      </div>
    </div>
  </div>
)

// Payment Page Skeleton
export const PaymentSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-52" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>

    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6">
      <Skeleton className="h-7 w-64 mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-6">
          <div className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 space-y-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3.5 w-3/4" />
          </div>

          <div className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] overflow-hidden">
            <div className="p-4 bg-[#FAFAFA] dark:bg-[#151515] border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
              <Skeleton className="h-4 w-40" />
            </div>
            <div className="divide-y divide-[#EAEAEA] dark:divide-[#2A2A2A]">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="p-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <Skeleton className="w-5 h-5" rounded="rounded-full" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                  <Skeleton className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 space-y-4">
          <Skeleton className="h-4 w-36" />
          <div className="space-y-2.5 py-2">
            <div className="flex justify-between"><Skeleton className="h-4 w-24" /><Skeleton className="h-4 w-16" /></div>
            <div className="flex justify-between"><Skeleton className="h-4 w-28" /><Skeleton className="h-4 w-12" /></div>
          </div>
          <div className="flex justify-between py-3 border-t border-[#EAEAEA] dark:border-[#2A2A2A]">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-12 w-full" rounded="rounded-[6px]" />
        </div>
      </div>
    </div>
  </div>
)

// All Orders Skeleton
export const OrderRowSkeleton = () => (
  <div className="py-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] space-y-4">
    <div className="flex justify-between items-start">
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-3 w-28" />
      </div>
      <div className="flex gap-3 items-center">
        <Skeleton className="h-6 w-24" rounded="rounded-full" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
    <div className="flex items-end justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <Skeleton className="w-16 h-16" rounded="rounded-[3px]" />
        <Skeleton className="w-16 h-16" rounded="rounded-[3px]" />
        <Skeleton className="w-16 h-16" rounded="rounded-[3px]" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" rounded="rounded-[3px]" />
        <Skeleton className="h-9 w-28" rounded="rounded-[3px]" />
      </div>
    </div>
  </div>
)

export const AllOrdersSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] text-[#111111] dark:text-[#E5E2E1] py-8 px-5 md:px-10">
    <div className="max-w-[900px] mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-1">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-3.5 w-64" />
        </div>
        <Skeleton className="h-10 w-full md:w-64" rounded="rounded-[3px]" />
      </div>

      <div className="flex gap-6 border-b border-[#EAEAEA] dark:border-[#2A2A2A] pb-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div>
        <OrderRowSkeleton />
        <OrderRowSkeleton />
        <OrderRowSkeleton />
      </div>
    </div>
  </div>
)

// Order Detail Skeleton
export const OrderDetailSkeleton = () => (
  <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0e0e0e] pb-20">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-white dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1100px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>

    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 space-y-6">
      {/* Banner */}
      <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-6 flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-5 w-28" rounded="rounded-full" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-3.5 w-48" />
        </div>
        <Skeleton className="h-10 w-28" rounded="rounded-[6px]" />
      </div>

      {/* Live tracking timeline */}
      <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-6 space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-5 gap-2 py-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <Skeleton className="w-10 h-10" rounded="rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-2.5 w-12" />
            </div>
          ))}
        </div>
      </div>

      {/* Courier card */}
      <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-5 flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <Skeleton className="w-10 h-10" rounded="rounded-full" />
          <div className="space-y-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <Skeleton className="h-9 w-32" rounded="rounded-[6px]" />
      </div>

      {/* Items list */}
      <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[12px] p-6 space-y-4">
        <Skeleton className="h-4 w-36 pb-2" />
        {[1, 2].map((i) => (
          <div key={i} className="flex justify-between items-center py-4 border-b border-[#F0F0F0] dark:border-[#252525] last:border-0">
            <div className="flex gap-4 items-center">
              <Skeleton className="w-16 h-20" rounded="rounded-[6px]" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <Skeleton className="h-5 w-20" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Order Group Items Skeleton
export const OrderGroupItemsSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1000px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>

    <div className="max-w-[1000px] mx-auto px-4 md:px-8 pt-6 space-y-6">
      <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[10px] p-6 text-center space-y-3">
        <Skeleton className="w-12 h-12 mx-auto" rounded="rounded-full" />
        <Skeleton className="h-6 w-60 mx-auto" />
        <Skeleton className="h-3.5 w-72 mx-auto" />
      </div>

      <div className="space-y-4">
        <Skeleton className="h-4 w-48" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#EAEAEA] dark:border-[#2A2A2A]">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-5 w-20" rounded="rounded" />
            </div>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-9 w-36" rounded="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// User Profile Skeleton
export const ProfileSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1240px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>

    <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6 space-y-8">
      {/* Banner */}
      <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[10px] p-6 flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <Skeleton className="w-14 h-14" rounded="rounded-full" />
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3.5 w-52" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28" rounded="rounded" />
          <Skeleton className="h-10 w-24" rounded="rounded" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" rounded="rounded" />
          <Skeleton className="h-10 w-full" rounded="rounded" />
          <Skeleton className="h-10 w-full" rounded="rounded" />
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24 w-full" rounded="rounded-[8px]" />
            <Skeleton className="h-24 w-full" rounded="rounded-[8px]" />
            <Skeleton className="h-24 w-full" rounded="rounded-[8px]" />
          </div>

          <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-6 space-y-4">
            <Skeleton className="h-4 w-36 pb-2" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-11 w-full" rounded="rounded" />
              <Skeleton className="h-11 w-full" rounded="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 2. SELLER SKELETONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Seller Dashboard Skeleton
export const SellerDashboardSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-12">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-2.5 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>

    <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-7 w-52" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-32" rounded="rounded" />
          <Skeleton className="h-9 w-24" rounded="rounded" />
          <Skeleton className="h-9 w-24" rounded="rounded" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[6px] p-4 space-y-2">
            <div className="flex justify-between"><Skeleton className="h-3 w-20" /><Skeleton className="h-4 w-4" /></div>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        ))}
      </div>

      {/* Chart & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[6px] p-4 space-y-4">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-[200px] w-full" rounded="rounded" />
        </div>
        <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[6px] p-4 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" rounded="rounded" />
          <Skeleton className="h-10 w-full" rounded="rounded" />
          <Skeleton className="h-10 w-full" rounded="rounded" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[6px] p-4 space-y-3">
        <Skeleton className="h-4 w-36 pb-2" />
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#EAEAEA] dark:border-[#2A2A2A] last:border-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-5 w-20" rounded="rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Seller Orders Queue Skeleton
export const SellerOrdersSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-4 px-6 md:px-10">
      <div className="max-w-5xl mx-auto space-y-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-3 w-64" />
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-6 space-y-6">
      <div className="flex gap-2 pb-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
        <Skeleton className="h-8 w-24" rounded="rounded" />
        <Skeleton className="h-8 w-28" rounded="rounded" />
        <Skeleton className="h-8 w-20" rounded="rounded" />
        <Skeleton className="h-8 w-20" rounded="rounded" />
      </div>

      <div className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[6px] divide-y divide-[#EAEAEA] dark:divide-[#2A2A2A]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 flex justify-between items-center">
            <div className="space-y-2">
              <div className="flex gap-2 items-center">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-20" rounded="rounded" />
              </div>
              <Skeleton className="h-3.5 w-48" />
              <Skeleton className="h-3.5 w-36" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" rounded="rounded" />
              <Skeleton className="h-9 w-20" rounded="rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Seller Inventory Product List Skeleton
export const SellerInventorySkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-4 px-6 md:px-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-3 w-64" />
        </div>
        <Skeleton className="h-9 w-32" rounded="rounded-lg" />
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-6 space-y-6">
      <div className="flex justify-between items-center pb-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A]">
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" rounded="rounded-md" />
          <Skeleton className="h-8 w-24" rounded="rounded-md" />
          <Skeleton className="h-8 w-28" rounded="rounded-md" />
        </div>
        <Skeleton className="h-8 w-56" rounded="rounded-lg" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-3 space-y-2">
            <Skeleton className="aspect-[4/5] w-full" rounded="rounded-lg" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <div className="grid grid-cols-2 gap-1.5 pt-2">
              <Skeleton className="h-7 w-full" rounded="rounded-md" />
              <Skeleton className="h-7 w-full" rounded="rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Seller Product Detail / Add Variant Skeleton
export const SellerProductDetailSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-16">
    <div className="border-b border-[#EAEAEA] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-3.5 px-4 md:px-8">
      <div className="max-w-[1200px] mx-auto flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
      </div>
    </div>

    <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 space-y-6">
      <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 flex justify-between items-center">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-36" rounded="rounded" />
      </div>

      <div className="border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] p-5 space-y-4">
        <Skeleton className="h-4 w-40 pb-2" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 bg-[#FAFAFA] dark:bg-[#151515] border border-[#EAEAEA] dark:border-[#2A2A2A] rounded-[8px] flex justify-between items-center">
            <div className="flex gap-4 items-center">
              <Skeleton className="w-14 h-16" rounded="rounded-[6px]" />
              <div className="space-y-1">
                <div className="flex gap-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-4 w-16" /></div>
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
            <div className="flex gap-6 items-center">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Seller Analytics Skeleton
export const SellerAnalyticsSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-12">
    <div className="border-b border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-4 px-6 md:px-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-8 w-44" rounded="rounded-md" />
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-5 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-6 space-y-4">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-6 w-36" rounded="rounded" />
        </div>
        <Skeleton className="h-56 w-full" rounded="rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-[#FAFAFA] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-6 space-y-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-44 w-full" rounded="rounded-full" />
        </div>
        <div className="lg:col-span-3 bg-[#FAFAFA] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-6 space-y-3">
          <Skeleton className="h-4 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A] last:border-0">
              <div className="flex gap-3 items-center">
                <Skeleton className="w-10 h-12" rounded="rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Seller Payments Skeleton
export const SellerPaymentsSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-12">
    <div className="border-b border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-4 px-6 md:px-10">
      <div className="max-w-5xl mx-auto flex justify-between items-center">
        <div className="space-y-1">
          <Skeleton className="h-3 w-36" />
          <Skeleton className="h-6 w-44" />
        </div>
        <Skeleton className="h-9 w-28" rounded="rounded-lg" />
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-6">
      <Skeleton className="h-24 w-full" rounded="rounded-xl" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Skeleton className="h-28 w-full" rounded="rounded-xl" />
        <Skeleton className="h-28 w-full" rounded="rounded-xl" />
        <Skeleton className="h-28 w-full" rounded="rounded-xl" />
      </div>

      <div className="bg-[#FAFAFA] dark:bg-[#151515] border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-6 space-y-4">
        <Skeleton className="h-4 w-36" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center py-3 border-b border-[#EBEBEB] dark:border-[#2A2A2A] last:border-0">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16" rounded="rounded" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    </div>
  </div>
)

// Seller Settings Skeleton
export const SellerSettingsSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] pb-12">
    <div className="border-b border-[#EBEBEB] dark:border-[#2A2A2A] bg-[#FAFAFA] dark:bg-[#151515] py-4 px-6 md:px-10">
      <div className="max-w-5xl mx-auto space-y-1">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-6 w-48" />
      </div>
    </div>

    <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-10">
      <div className="space-y-4">
        <Skeleton className="h-4 w-44" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-6 space-y-3">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-10 w-full" rounded="rounded-lg" />
            </div>
          ))}
        </div>
      </div>

      <div className="border border-[#EBEBEB] dark:border-[#2A2A2A] rounded-xl p-7 space-y-4">
        <Skeleton className="h-4 w-36" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-11 w-full" rounded="rounded-lg" />
          <Skeleton className="h-11 w-full" rounded="rounded-lg" />
          <Skeleton className="h-11 w-full" rounded="rounded-lg" />
        </div>
      </div>
    </div>
  </div>
)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 3. ADMIN SKELETONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Admin Sellers Registry Skeleton
export const AdminSellersSkeleton = () => (
  <div className="space-y-6">
    <div className="flex justify-between items-center pb-4 border-b border-white/10">
      <div className="space-y-1">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-3.5 w-72" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-8 w-36" rounded="rounded-full" />
        <Skeleton className="h-8 w-36" rounded="rounded-full" />
      </div>
    </div>

    <div className="flex justify-between items-center gap-4">
      <Skeleton className="h-11 w-80" rounded="rounded-[6px]" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-16" rounded="rounded-[6px]" />
        <Skeleton className="h-8 w-28" rounded="rounded-[6px]" />
        <Skeleton className="h-8 w-24" rounded="rounded-[6px]" />
      </div>
    </div>

    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-[#131313] border border-white/10 rounded-[10px] p-5 flex justify-between items-center">
          <div className="flex gap-4 items-center">
            <Skeleton className="w-11 h-11" rounded="rounded-full" />
            <div className="space-y-1.5">
              <div className="flex gap-3 items-center">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-24" rounded="rounded-full" />
              </div>
              <Skeleton className="h-3 w-56" />
            </div>
          </div>
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  </div>
)

// Admin Seller Detail Skeleton
export const AdminSellerDetailSkeleton = () => (
  <div className="space-y-8">
    <Skeleton className="h-4 w-44" />

    <div className="bg-[#131313] border border-white/10 rounded-[12px] p-6 md:p-8 flex justify-between items-center">
      <div className="space-y-2">
        <div className="flex gap-3 items-center">
          <Skeleton className="h-5 w-28" rounded="rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-3.5 w-64" />
      </div>
      <div className="flex gap-3">
        <Skeleton className="h-12 w-44" rounded="rounded-[6px]" />
        <Skeleton className="h-12 w-40" rounded="rounded-[6px]" />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-3">
        <Skeleton className="h-4 w-48 pb-2" />
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-3/4" />
      </div>
      <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-3">
        <Skeleton className="h-4 w-48 pb-2" />
        <Skeleton className="h-3.5 w-40" />
        <Skeleton className="h-3.5 w-40" />
      </div>
    </div>

    <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-4">
      <Skeleton className="h-4 w-60 pb-2" />
      <Skeleton className="h-48 max-w-md w-full" rounded="rounded-[8px]" />
    </div>
  </div>
)

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * 4. AUTH & GATE ROUTE SKELETONS
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const ProtectedSkeleton = () => (
  <div className="min-h-screen bg-white dark:bg-[#0e0e0e] flex flex-col items-center justify-center p-6 space-y-4">
    <Skeleton className="w-12 h-12" rounded="rounded-full" />
    <Skeleton className="h-4 w-48" />
    <Skeleton className="h-3 w-32" />
  </div>
)

export const ProtectedAdminSkeleton = () => (
  <div className="min-h-screen bg-[#0e0e0e] flex flex-col items-center justify-center p-6 space-y-4">
    <Skeleton className="w-12 h-12" rounded="rounded-full" />
    <Skeleton className="h-4 w-40 bg-white/20" />
    <Skeleton className="h-3 w-28 bg-white/10" />
  </div>
)
