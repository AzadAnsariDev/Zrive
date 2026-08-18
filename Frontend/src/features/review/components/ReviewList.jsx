import React, { useState } from 'react'
import { Star, ThumbsUp, ShieldCheck, Store } from 'lucide-react'
import { useReview } from '../hook/useReview'

const maskName = (name) => {
  if (!name) return 'ZRIVE Customer'
  const parts = name.trim().split(' ')
  const first = parts[0]
  const lastInitial = parts[1] ? ` ${parts[1][0]}.` : ''
  return `${first}${lastInitial}`
}

const ReviewCard = ({ review }) => {
  const { handleToggleHelpful } = useReview()
  const [helpfulCount, setHelpfulCount] = useState(review.helpfulCount || 0)
  const [marked, setMarked] = useState(false)

  const onHelpful = async () => {
    const result = await handleToggleHelpful(review._id)
    if (result) {
      setHelpfulCount(result.helpfulCount)
      setMarked(result.marked)
    }
  }

  return (
    <div className="py-5 border-b border-[#EAEAEA] last:border-0">
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-0.5 bg-[#111111] text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
          {review.rating} <Star size={9} fill="white" stroke="white" />
        </div>
        {review.title && (
          <p className="text-[13px] font-semibold text-[#111]">{review.title}</p>
        )}
      </div>

      {review.comment && (
        <p className="text-[12.5px] text-[#444] leading-relaxed mb-3">{review.comment}</p>
      )}

      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt="review"
              className="w-16 h-16 rounded object-cover border border-[#EAEAEA] cursor-pointer"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 text-[11px] text-[#999]">
        <span className="font-semibold text-[#555]">{maskName(review.user?.name)}</span>
        {review.isVerifiedPurchase && (
          <span className="flex items-center gap-1 text-[#287A4B] font-medium">
            <ShieldCheck size={12} /> Verified Purchase
          </span>
        )}
        <span>{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
      </div>

      <button
        type="button"
        onClick={onHelpful}
        className={`flex items-center gap-1.5 mt-3 text-[11.5px] font-medium transition-colors cursor-pointer ${
          marked ? 'text-[#B08D57]' : 'text-[#999] hover:text-[#111]'
        }`}
      >
        <ThumbsUp size={13} fill={marked ? '#B08D57' : 'none'} />
        Helpful {helpfulCount > 0 && `(${helpfulCount})`}
      </button>

      {review.sellerReply?.text && (
        <div className="mt-3 ml-2 pl-3 border-l-2 border-[#B08D57] bg-[#FBF9F6] rounded-r-lg py-2.5 px-3">
          <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#B08D57] mb-1">
            <Store size={12} /> Seller Response
          </p>
          <p className="text-[12px] text-[#555] leading-relaxed">{review.sellerReply.text}</p>
        </div>
      )}
    </div>
  )
}

const ReviewList = ({ reviews, pagination, onLoadMore, loading }) => {
  if (!reviews?.length) return null

  return (
    <div className="mt-4">
      {reviews.map((review) => (
        <ReviewCard key={review._id} review={review} />
      ))}

      {pagination.page < pagination.totalPages && (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={loading}
          className="w-full mt-4 py-2.5 rounded-lg border border-[#EAEAEA] text-[12px] font-bold text-[#111] hover:border-[#B08D57] hover:text-[#B08D57] transition-all cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load More Reviews'}
        </button>
      )}
    </div>
  )
}

export default ReviewList