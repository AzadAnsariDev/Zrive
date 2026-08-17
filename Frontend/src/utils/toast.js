import { toast } from 'sonner'

/**
 * Normalizes any error object, string, or HTTP error into a concise, human-friendly message.
 * Ensures raw tech stack traces, MongoDB error codes, AxiosError, or server statuses are never shown to users.
 */
export const getCleanErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (!error) return fallback

  if (typeof error === 'string') {
    const lower = error.toLowerCase().trim()
    if (
      lower.includes('axios') ||
      lower.includes('network error') ||
      lower.includes('status code') ||
      lower.includes('objectid') ||
      lower.includes('500') ||
      lower.includes('404') ||
      lower.includes('jwt') ||
      lower.includes('internal server') ||
      lower.includes('econnrefused') ||
      lower.includes('failed to fetch') ||
      lower.includes('syntaxerror')
    ) {
      return fallback
    }
    return error
  }

  // Handle HTTP status codes
  const status = error.response?.status
  if (status === 401) return 'Please log in to continue.'
  if (status === 403) return 'You do not have permission for this action.'
  if (status === 404) return 'Requested item not found.'
  if (status === 429) return 'Too many attempts. Please try again shortly.'
  if (status >= 500) return 'Service temporarily unavailable. Please try again.'
  
  if (error.code === 'ERR_NETWORK' || error.message?.toLowerCase().includes('network')) {
    return 'Unable to connect. Please check your internet.'
  }

  // Check backend provided message
  const backendMsg =
    error.response?.data?.message ||
    error.response?.data?.error ||
    (typeof error.message === 'string' && !error.message.includes('Axios') ? error.message : null)

  if (backendMsg && typeof backendMsg === 'string') {
    const lowerMsg = backendMsg.toLowerCase()
    if (
      lowerMsg.includes('e11000') ||
      lowerMsg.includes('cast to') ||
      lowerMsg.includes('validation failed') ||
      lowerMsg.includes('stack') ||
      lowerMsg.includes('mongo') ||
      lowerMsg.includes('jwt')
    ) {
      return fallback
    }
    return backendMsg
  }

  return fallback
}

/**
 * Standardized ZRIVE toast notification helper using Sonner.
 */
export const notify = {
  success: (message, options = {}) => {
    return toast.success(message, {
      duration: 2500,
      ...options,
    })
  },

  error: (err, fallback = 'Something went wrong. Please try again.', options = {}) => {
    const message = getCleanErrorMessage(err, fallback)
    return toast.error(message, {
      duration: 3000,
      ...options,
    })
  },

  info: (message, options = {}) => {
    return toast.info(message, {
      duration: 2500,
      ...options,
    })
  },

  warning: (message, options = {}) => {
    return toast.warning(message, {
      duration: 2500,
      ...options,
    })
  },

  dismiss: (id) => {
    toast.dismiss(id)
  },
}

export { toast }
