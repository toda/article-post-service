/**
 * Firestore timestamp formatting utilities
 */

/**
 * Format Firestore timestamp or date into Japanese relative time format
 * @param {*} dateValue - Firestore timestamp, Date object, string, or number
 * @param {string} type - 'relative' for relative time (default), 'full' for full date
 * @returns {string} Formatted date string
 */
export function formatDate(dateValue, type = 'relative') {
  if (!dateValue) return '日時不明'

  let date
  try {
    // Handle Firestore Timestamp object with seconds property
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000)
    }
    // Handle Firestore Timestamp with toDate method
    else if (dateValue && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate()
    }
    // Handle string dates
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue)
    }
    // Handle Date objects
    else if (dateValue instanceof Date) {
      date = dateValue
    }
    // Handle timestamp numbers
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue)
    }
    else {
      console.warn('Unknown date format:', dateValue)
      return '日時不明'
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateValue)
      return '日時不明'
    }

    if (type === 'full') {
      return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    }

    // Default: relative time format
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'たった今'
    if (diffMins < 60) return `${diffMins}分前`
    if (diffHours < 24) return `${diffHours}時間前`
    if (diffDays < 7) return `${diffDays}日前`

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', error, dateValue)
    return '日時不明'
  }
}

/**
 * Format date with time for detailed view
 * @param {*} dateValue - Firestore timestamp, Date object, string, or number
 * @returns {string} Formatted date and time string
 */
export function formatDateTime(dateValue) {
  if (!dateValue) return '日時不明'

  let date
  try {
    // Handle Firestore Timestamp object with seconds property
    if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000)
    }
    // Handle Firestore Timestamp with toDate method
    else if (dateValue && typeof dateValue.toDate === 'function') {
      date = dateValue.toDate()
    }
    // Handle string dates
    else if (typeof dateValue === 'string') {
      date = new Date(dateValue)
    }
    // Handle Date objects
    else if (dateValue instanceof Date) {
      date = dateValue
    }
    // Handle timestamp numbers
    else if (typeof dateValue === 'number') {
      date = new Date(dateValue)
    }
    else {
      console.warn('Unknown date format for datetime:', dateValue)
      return '日時不明'
    }

    // Validate the date
    if (isNaN(date.getTime())) {
      console.warn('Invalid date for datetime:', dateValue)
      return '日時不明'
    }

    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('Error formatting datetime:', error, dateValue)
    return '日時不明'
  }
}