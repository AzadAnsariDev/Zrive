import React, { useState } from 'react'
import { X, Star } from 'lucide-react'

const ReviewForm = ({ onClose, onSubmit, submitting }) => {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating to continue.')
      return
    }
    setError('')
    try {
      await onSubmit({ rating, title, comment })
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="w-full sm:max-w-[440px] bg-white rounded-t-[16px] sm:rounded-[10px] p-6 sm:p-7 animate-[slideUp_0.25s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-[18px] font-bold text-[#111]">Write a Review</h3>
          <button type="button" onClick={onClose} className="text-[#999] hover:text-[#111] cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* Star selector */}
        <div className="flex flex-col items-center gap-2 py-4 mb-2">
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => { setRating(i); setError('') }}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                <Star
                  size={30}
                  fill={i <= (hoverRating || rating) ? '#B08D57' : 'none'}
                  stroke="#B08D57"
                  strokeWidth={1.5}
                />
              </button>
            ))}
          </div>
          <p className="text-[11.5px] text-[#999] font-medium">
            {rating === 0 && 'Tap to rate'}
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </p>
        </div>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your review a title (optional)"
          className="w-full border border-[#EAEAEA] rounded-lg px-3.5 py-2.5 text-[13px] mb-3 outline-none focus:border-[#B08D57] transition-colors"
        />

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share fit, fabric, quality — what stood out?"
          rows={4}
          className="w-full border border-[#EAEAEA] rounded-lg px-3.5 py-2.5 text-[13px] mb-2 outline-none focus:border-[#B08D57] transition-colors resize-none"
        />

        {error && <p className="text-[11.5px] text-[#C43D3D] mb-2">{error}</p>}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full mt-3 py-3 rounded-lg bg-[#111111] text-white text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all disabled:opacity-50 cursor-pointer"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </div>
    </div>
  )
}

export default ReviewForm