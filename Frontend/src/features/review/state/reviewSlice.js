import { createSlice } from '@reduxjs/toolkit'

const reviewSlice = createSlice({
    name: "review",
    initialState: {
        reviews: [],
        pagination: { total: 0, page: 1, totalPages: 1 },
        canReview: false,
        alreadyReviewed: false,
        loading: {
            fetch: false,
            create: false,
            eligibility: false
        }
    },
    reducers: {
        setReviews: (state, action) => {
            state.reviews = action.payload
        },
        appendReviews: (state, action) => {
            state.reviews = [...state.reviews, ...action.payload]
        },
        setPagination: (state, action) => {
            state.pagination = action.payload
        },
        setEligibility: (state, action) => {
            state.canReview = action.payload.canReview
            state.alreadyReviewed = action.payload.alreadyReviewed
        },
        updateHelpful: (state, action) => {
            const { reviewId, helpfulCount, marked } = action.payload
            const review = state.reviews.find(r => r._id === reviewId)
            if (review) {
                review.helpfulCount = helpfulCount
                review.markedHelpful = marked
            }
        },
        removeReview: (state, action) => {
            state.reviews = state.reviews.filter(r => r._id !== action.payload)
        },
        setFetchLoading: (state, action) => {
            state.loading.fetch = action.payload
        },
        setCreateLoading: (state, action) => {
            state.loading.create = action.payload
        },
        setEligibilityLoading: (state, action) => {
            state.loading.eligibility = action.payload
        },
        clearReviews: (state) => {
            state.reviews = []
            state.pagination = { total: 0, page: 1, totalPages: 1 }
        }
    }
})

export const {
    setReviews,
    appendReviews,
    setPagination,
    setEligibility,
    updateHelpful,
    removeReview,
    setFetchLoading,
    setCreateLoading,
    setEligibilityLoading,
    clearReviews
} = reviewSlice.actions

export default reviewSlice.reducer