import React from 'react'
import { Star, PenLine, Sparkles } from 'lucide-react'

const RatingBar = ({ star, count, total }) => {
  const pct = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="flex items-center gap-2.5 text-[12px]">
      <span className="flex items-center gap-1 w-8 text-[#555] font-medium">
        {star} <Star size={10} fill="#B08D57" stroke="#B08D57" />
      </span>
      <div className="flex-1 h-1.5 rounded-full bg-[#F0F0F0] overflow-hidden">
        <div
          className="h-full bg-[#B08D57] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-8 text-right text-[#999]">{count}</span>
    </div>
  )
}

const ReviewSummary = ({ product, canReview, onWriteReview }) => {
  const avgRating = product?.avgRating ?? 0
  const totalReviews = product?.totalReviews ?? 0
  const breakdown = product?.ratingBreakdown ?? { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  if (totalReviews === 0) {
    return (
      <div className="border-t border-[#EAEAEA] pt-8 mt-10">
        <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#B08D57] mb-6">
          Ratings & Reviews
        </h2>
        <div className="rounded-[8px] border border-dashed border-[#E0D5C5] bg-[#FBF9F6] px-6 py-10 text-center">
          <Sparkles size={22} className="mx-auto text-[#B08D57] mb-3" strokeWidth={1.5} />
          <p className="font-display text-[16px] font-semibold text-[#111] mb-1.5">
            Be the first to believe in this piece
          </p>
          <p className="text-[12.5px] text-[#777] max-w-[340px] mx-auto mb-5 leading-relaxed">
            No reviews yet — your experience could help someone else shop with confidence.
          </p>
          {canReview && (
            <button
              type="button"
              onClick={onWriteReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#111111] text-white text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
            >
              <PenLine size={14} />
              Write the First Review
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="border-t border-[#EAEAEA] pt-8 mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#B08D57]">
          Ratings & Reviews
        </h2>
        {canReview && (
          <button
            type="button"
            onClick={onWriteReview}
            className="flex items-center gap-1.5 text-[11.5px] font-bold text-[#111111] hover:text-[#B08D57] transition-colors cursor-pointer"
          >
            <PenLine size={13} />
            Write a Review
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
        {/* Left — big number */}
        <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-1 shrink-0">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-[38px] font-bold text-[#111] leading-none">
              {avgRating.toFixed(1)}
            </span>
            <Star size={16} fill="#B08D57" stroke="#B08D57" className="mb-1" />
          </div>
          <p className="text-[12px] text-[#777]">
            {totalReviews} {totalReviews === 1 ? 'Rating' : 'Ratings'}
          </p>
        </div>

        {/* Right — breakdown bars */}
        <div className="flex-1 max-w-[280px] space-y-1.5">
          {[5, 4, 3, 2, 1].map((star) => (
            <RatingBar key={star} star={star} count={breakdown[star] || 0} total={totalReviews} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ReviewSummary