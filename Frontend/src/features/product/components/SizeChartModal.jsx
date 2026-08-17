import React, { useState } from 'react'
import {
  X,
  Ruler,
  Footprints,
  Shirt,
  Info,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react'

// Helper to determine category classification
export const isCategoryWithoutSizeChart = (category) => {
  if (!category) return false
  const cat = category.toLowerCase().trim()
  return [
    'perfumes',
    'perfume',
    'sunglasses',
    'sunglass',
    'glasses',
    'eyewear',
    'fragrance',
    'fragrances',
    'accessories',
    'accessory',
    'wallets',
    'wallet',
    'belts',
    'belt',
    'watches',
    'watch',
    'caps',
    'cap',
    'hats',
  ].includes(cat)
}

export const isFootwearCategory = (category) => {
  if (!category) return false
  const cat = category.toLowerCase().trim()
  return [
    'shoes',
    'shoe',
    'footwear',
    'sneakers',
    'sneaker',
    'sandals',
    'sandal',
    'flip-flops',
    'sports-shoes',
    'formal-shoes',
    'boots',
    'loafers',
  ].includes(cat)
}

export const isBottomwearCategory = (category) => {
  if (!category) return false
  const cat = category.toLowerCase().trim()
  return [
    'jeans',
    'jean',
    'trousers',
    'trouser',
    'formal-trousers',
    'casual-trousers',
    'shorts',
    'track-pants',
    'pants',
    'joggers',
    'bottomwear',
  ].includes(cat)
}

// Shoe Sizing Data
const SHOE_SIZES = [
  { uk: 'UK 6', us: 'US 7', eu: 'EU 40', cm: '25.0 cm', in: '9.8 in' },
  { uk: 'UK 7', us: 'US 8', eu: 'EU 41', cm: '25.8 cm', in: '10.1 in' },
  { uk: 'UK 8', us: 'US 9', eu: 'EU 42', cm: '26.7 cm', in: '10.5 in' },
  { uk: 'UK 9', us: 'US 10', eu: 'EU 43', cm: '27.5 cm', in: '10.8 in' },
  { uk: 'UK 10', us: 'US 11', eu: 'EU 44', cm: '28.3 cm', in: '11.1 in' },
  { uk: 'UK 11', us: 'US 12', eu: 'EU 45', cm: '29.2 cm', in: '11.5 in' },
  { uk: 'UK 12', us: 'US 13', eu: 'EU 46', cm: '30.0 cm', in: '11.8 in' },
]

// Tops Data (T-Shirts, Shirts, Jackets, Hoodies, Blazers)
const TOPS_SIZES = [
  { size: 'XS', chestIn: '36"', chestCm: '91.5 cm', lengthIn: '26.5"', lengthCm: '67 cm', shoulderIn: '16.5"', shoulderCm: '42 cm', sleeveIn: '8.0"', sleeveCm: '20 cm' },
  { size: 'S',  chestIn: '38"', chestCm: '96.5 cm', lengthIn: '27.5"', lengthCm: '70 cm', shoulderIn: '17.0"', shoulderCm: '43 cm', sleeveIn: '8.5"', sleeveCm: '21.5 cm' },
  { size: 'M',  chestIn: '40"', chestCm: '101.5 cm', lengthIn: '28.0"', lengthCm: '71 cm', shoulderIn: '17.5"', shoulderCm: '44.5 cm', sleeveIn: '8.5"', sleeveCm: '21.5 cm' },
  { size: 'L',  chestIn: '42"', chestCm: '106.5 cm', lengthIn: '28.5"', lengthCm: '72.5 cm', shoulderIn: '18.0"', shoulderCm: '45.5 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
  { size: 'XL', chestIn: '44"', chestCm: '111.5 cm', lengthIn: '29.0"', lengthCm: '73.5 cm', shoulderIn: '18.5"', shoulderCm: '47 cm', sleeveIn: '9.0"', sleeveCm: '23 cm' },
  { size: 'XXL',chestIn: '46"', chestCm: '117 cm', lengthIn: '29.5"', lengthCm: '75 cm', shoulderIn: '19.0"', shoulderCm: '48.5 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
  { size: '3XL',chestIn: '48"', chestCm: '122 cm', lengthIn: '30.0"', lengthCm: '76 cm', shoulderIn: '19.5"', shoulderCm: '49.5 cm', sleeveIn: '9.5"', sleeveCm: '24 cm' },
]

// Bottoms Data (Jeans, Trousers, Shorts)
const BOTTOMS_SIZES = [
  { size: '28 (S)',  waistIn: '28"', waistCm: '71 cm', inseamIn: '30.5"', inseamCm: '77.5 cm', hipIn: '36"', hipCm: '91.5 cm', thighIn: '21"', thighCm: '53 cm' },
  { size: '30 (M)',  waistIn: '30"', waistCm: '76 cm', inseamIn: '31.0"', inseamCm: '78.5 cm', hipIn: '38"', hipCm: '96.5 cm', thighIn: '22"', thighCm: '56 cm' },
  { size: '32 (L)',  waistIn: '32"', waistCm: '81 cm', inseamIn: '31.5"', inseamCm: '80 cm', hipIn: '40"', hipCm: '101.5 cm', thighIn: '23"', thighCm: '58.5 cm' },
  { size: '34 (XL)', waistIn: '34"', waistCm: '86.5 cm', inseamIn: '32.0"', inseamCm: '81 cm', hipIn: '42"', hipCm: '106.5 cm', thighIn: '24"', thighCm: '61 cm' },
  { size: '36 (XXL)',waistIn: '36"', waistCm: '91.5 cm', inseamIn: '32.5"', inseamCm: '82.5 cm', hipIn: '44"', hipCm: '112 cm', thighIn: '25"', thighCm: '63.5 cm' },
  { size: '38 (3XL)',waistIn: '38"', waistCm: '96.5 cm', inseamIn: '32.5"', inseamCm: '82.5 cm', hipIn: '46"', hipCm: '117 cm', thighIn: '26"', thighCm: '66 cm' },
]

const SizeChartModal = ({ onClose, category = '', selectedSize = '' }) => {
  const isShoes = isFootwearCategory(category)
  const isBottom = isBottomwearCategory(category)

  const [activeTab, setActiveTab] = useState(isShoes ? 'shoes' : isBottom ? 'bottoms' : 'tops')
  const [unit, setUnit] = useState('in') // 'in' or 'cm'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#EAEAEA] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-[#EAEAEA] flex items-start justify-between bg-gradient-to-r from-[#FAFAFA] to-white shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-md bg-[#B08D57]/10 text-[#B08D57]">
                {isShoes ? <Footprints size={18} /> : <Shirt size={18} />}
              </span>
              <span className="text-[10.5px] font-bold tracking-[0.14em] uppercase text-[#B08D57]">
                Official Sizing Guide
              </span>
            </div>
            <h2 className="font-display text-[20px] sm:text-[22px] font-bold text-[#111111] leading-snug">
              {isShoes ? "Footwear Size Chart" : "Garment & Apparel Size Chart"}
            </h2>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Standard body and product measurement guide for an accurate fit.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-9 h-9 rounded-full bg-[#F5F5F5] hover:bg-[#EAEAEA] text-[#666666] hover:text-[#111111] flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Controls Bar */}
        <div className="px-5 sm:px-6 py-3.5 bg-[#FAFAFA] border-b border-[#EAEAEA] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Garment Tabs (Only for non-shoes) */}
          {!isShoes ? (
            <div className="flex items-center gap-1.5 bg-[#EAEAEA]/80 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('tops')}
                className={`px-3 py-1.5 rounded-md text-[11.5px] font-bold transition-all ${
                  activeTab === 'tops'
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Tops & Outerwear
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bottoms')}
                className={`px-3 py-1.5 rounded-md text-[11.5px] font-bold transition-all ${
                  activeTab === 'bottoms'
                    ? 'bg-white text-[#111111] shadow-sm'
                    : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Bottomwear & Jeans
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[11.5px] font-bold text-[#111111]">
              <span className="w-2 h-2 rounded-full bg-[#B08D57]" />
              Men's & Unisex Footwear
            </div>
          )}

          {/* Unit Switcher */}
          <div className="flex items-center gap-1.5 bg-white border border-[#EAEAEA] rounded-lg p-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => setUnit('in')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                unit === 'in'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              Inches (in)
            </button>
            <button
              type="button"
              onClick={() => setUnit('cm')}
              className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                unit === 'cm'
                  ? 'bg-[#111111] text-white shadow-sm'
                  : 'text-[#666666] hover:text-[#111111]'
              }`}
            >
              CM (cm)
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Table Container */}
          <div className="border border-[#EAEAEA] rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              {isShoes ? (
                /* Shoes Size Table */
                <table className="w-full text-left text-[12.5px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#EAEAEA] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666]">
                      <th className="py-3 px-4">UK / IND Size</th>
                      <th className="py-3 px-4">US Size</th>
                      <th className="py-3 px-4">EU Size</th>
                      <th className="py-3 px-4">Foot Length ({unit.toUpperCase()})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] text-[#111]">
                    {SHOE_SIZES.map((row, idx) => {
                      const isHighlighted =
                        selectedSize &&
                        (row.uk.toLowerCase().includes(selectedSize.toLowerCase()) ||
                          row.uk === `UK ${selectedSize}` ||
                          row.uk === selectedSize)
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B08D57]/10 font-bold'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-[#FAFAFA]/50'
                          } hover:bg-[#F5F5F5]`}
                        >
                          <td className="py-3 px-4 font-bold text-[#111]">
                            <div className="flex items-center gap-2">
                              {row.uk}
                              {isHighlighted && (
                                <span className="text-[9px] bg-[#B08D57] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#444]">{row.us}</td>
                          <td className="py-3 px-4 text-[#444]">{row.eu}</td>
                          <td className="py-3 px-4 font-semibold text-[#111]">
                            {unit === 'in' ? row.in : row.cm}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : activeTab === 'tops' ? (
                /* Tops & Outerwear Table */
                <table className="w-full text-left text-[12.5px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#EAEAEA] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666]">
                      <th className="py-3 px-4">Size</th>
                      <th className="py-3 px-4">Chest</th>
                      <th className="py-3 px-4">Front Length</th>
                      <th className="py-3 px-4">Shoulder</th>
                      <th className="py-3 px-4">Sleeve</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] text-[#111]">
                    {TOPS_SIZES.map((row, idx) => {
                      const isHighlighted =
                        selectedSize && row.size.toLowerCase() === selectedSize.toLowerCase()
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B08D57]/10 font-bold'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-[#FAFAFA]/50'
                          } hover:bg-[#F5F5F5]`}
                        >
                          <td className="py-3 px-4 font-bold text-[#111]">
                            <div className="flex items-center gap-2">
                              {row.size}
                              {isHighlighted && (
                                <span className="text-[9px] bg-[#B08D57] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.chestIn : row.chestCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.lengthIn : row.lengthCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.shoulderIn : row.shoulderCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.sleeveIn : row.sleeveCm}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              ) : (
                /* Bottoms & Jeans Table */
                <table className="w-full text-left text-[12.5px] border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAFA] border-b border-[#EAEAEA] text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666]">
                      <th className="py-3 px-4">Waist / Size</th>
                      <th className="py-3 px-4">To Fit Waist</th>
                      <th className="py-3 px-4">Inseam Length</th>
                      <th className="py-3 px-4">Hip</th>
                      <th className="py-3 px-4">Thigh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EAEAEA] text-[#111]">
                    {BOTTOMS_SIZES.map((row, idx) => {
                      const isHighlighted =
                        selectedSize &&
                        (row.size.toLowerCase().includes(selectedSize.toLowerCase()) ||
                          row.size.startsWith(selectedSize))
                      return (
                        <tr
                          key={idx}
                          className={`transition-colors ${
                            isHighlighted
                              ? 'bg-[#B08D57]/10 font-bold'
                              : idx % 2 === 0
                              ? 'bg-white'
                              : 'bg-[#FAFAFA]/50'
                          } hover:bg-[#F5F5F5]`}
                        >
                          <td className="py-3 px-4 font-bold text-[#111]">
                            <div className="flex items-center gap-2">
                              {row.size}
                              {isHighlighted && (
                                <span className="text-[9px] bg-[#B08D57] text-white px-1.5 py-0.5 rounded font-bold uppercase">
                                  Selected
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.waistIn : row.waistCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.inseamIn : row.inseamCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.hipIn : row.hipCm}
                          </td>
                          <td className="py-3 px-4 text-[#333]">
                            {unit === 'in' ? row.thighIn : row.thighCm}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Step-by-Step Measurement Guide (Like Myntra / Meesho) */}
          <div className="bg-[#FAFAFA] rounded-xl border border-[#EAEAEA] p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} className="text-[#B08D57]" />
              <h3 className="text-[12.5px] font-bold uppercase tracking-[0.08em] text-[#111111]">
                {isShoes ? 'How to Measure Foot Length' : 'How to Measure Yourself'}
              </h3>
            </div>

            {isShoes ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-[#555]">
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold mb-2">
                    1
                  </div>
                  <strong className="block text-[#111] font-semibold mb-1">Stand on paper</strong>
                  Place a piece of plain paper on a flat, hard floor with your heel firmly touching a wall.
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold mb-2">
                    2
                  </div>
                  <strong className="block text-[#111] font-semibold mb-1">Mark the longest toe</strong>
                  Use a pen to mark the farthest point of your longest toe on the paper.
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <div className="w-5 h-5 rounded-full bg-[#111111] text-white flex items-center justify-center text-[10px] font-bold mb-2">
                    3
                  </div>
                  <strong className="block text-[#111] font-semibold mb-1">Measure the distance</strong>
                  Measure the distance from the wall to your mark with a ruler in CM or Inches.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px] text-[#555]">
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <strong className="block text-[#111] font-semibold mb-1">1. Chest / Bust</strong>
                  Measure around the fullest part of your chest, keeping the tape horizontal under arms and across shoulder blades.
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <strong className="block text-[#111] font-semibold mb-1">2. Shoulder Width</strong>
                  Measure across the upper back from the tip of the left shoulder seam to the tip of the right shoulder seam.
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <strong className="block text-[#111] font-semibold mb-1">3. Front Length</strong>
                  Measure straight down from the highest point of the shoulder seam next to collar to the bottom hem.
                </div>
                <div className="p-3 bg-white rounded-lg border border-[#EAEAEA]">
                  <strong className="block text-[#111] font-semibold mb-1">4. Waist & Inseam</strong>
                  Measure around your natural waistline. For inseam, measure from the crotch point down to the ankle hem.
                </div>
              </div>
            )}
          </div>

          {/* Sizing Tips Box */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-[#F5EFE5]/50 border border-[#D4B982]/60 text-[12px] text-[#666]">
            <Info size={18} className="text-[#B08D57] shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-[#111] font-bold">Fit Recommendation: </strong>
              {isShoes
                ? "If you have broad feet or are between two sizes, we recommend ordering one size up for a relaxed, comfortable fit."
                : "All ZRIVE garments feature standard premium tailoring. If you prefer a loose / relaxed streetwear drape, select one size up."}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-[#EAEAEA] bg-white flex items-center justify-between gap-4 shrink-0">
          <span className="text-[11.5px] text-[#777] hidden sm:inline">
            Need more help? Hassle-free 7-day exchanges available on all orders.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] text-white rounded-lg text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  )
}

export default SizeChartModal
