/**
 * Image Proxy API
 * Proxies external images to avoid CORS issues
 */
export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const url = query.url

    if (!url) {
      throw createError({
        statusCode: 400,
        statusMessage: 'URL parameter is required'
      })
    }

    // Validate URL to prevent SSRF attacks
    const allowedDomains = [
      'googleusercontent.com',
      'gravatar.com',
      'githubusercontent.com',
      'avatars.githubusercontent.com'
    ]

    let parsedUrl
    try {
      parsedUrl = new URL(url)
    } catch (error) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid URL format'
      })
    }

    const isAllowed = allowedDomains.some(domain =>
      parsedUrl.hostname.includes(domain)
    )

    if (!isAllowed) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Domain not allowed'
      })
    }

    console.log('🔄 Proxying image:', url)

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': parsedUrl.origin
      }
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch image: ${response.statusText}`
      })
    }

    // Set appropriate headers
    setHeader(event, 'Content-Type', response.headers.get('Content-Type') || 'image/jpeg')
    setHeader(event, 'Cache-Control', 'public, max-age=86400') // Cache for 24 hours
    setHeader(event, 'Access-Control-Allow-Origin', '*')
    setHeader(event, 'Cross-Origin-Resource-Policy', 'cross-origin')

    // Return the image buffer
    return response.body

  } catch (error) {
    console.error('❌ Image proxy error:', error)

    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image'
    })
  }
})