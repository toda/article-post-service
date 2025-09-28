/**
 * Image proxy endpoint to handle CORS issues with external images
 */
export default defineEventHandler(async (event) => {
  console.log('🔄 Proxy image request received:', getQuery(event))
  const query = getQuery(event)
  const { url } = query

  if (!url) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing URL parameter'
    })
  }

  try {
    // Validate URL to prevent abuse
    const urlObj = new URL(url)
    const allowedHosts = [
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
      'platform-lookaside.fbsbx.com'
    ]

    if (!allowedHosts.includes(urlObj.hostname)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Host not allowed'
      })
    }

    // Fetch the image
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NuxtApp/1.0)',
        'Referer': 'https://accounts.google.com'
      }
    })

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: 'Failed to fetch image'
      })
    }

    // Get the image data and content type
    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'image/jpeg'

    // Set appropriate headers
    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=3600') // Cache for 1 hour
    setHeader(event, 'Access-Control-Allow-Origin', '*')

    return new Uint8Array(imageBuffer)
  } catch (error) {
    console.error('Proxy image error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to proxy image'
    })
  }
})