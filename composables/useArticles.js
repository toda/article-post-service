/**
 * Articles Composable
 * Handles article CRUD operations, discovery, and interactions
 */

import { ref, computed } from 'vue'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  addDoc,
  increment,
  serverTimestamp,
  writeBatch,
  documentId
} from 'firebase/firestore'
import { useFirestore } from '~/composables/useFirestore'
import { useAuth } from '~/composables/useAuth'

// Error codes from contract
export const ArticleErrorCodes = {
  // Article Errors
  ARTICLE_NOT_FOUND: 'article/not-found',
  ARTICLE_UNAUTHORIZED: 'article/unauthorized',
  ARTICLE_TITLE_REQUIRED: 'article/title-required',
  ARTICLE_CONTENT_REQUIRED: 'article/content-required',
  ARTICLE_CATEGORY_INVALID: 'article/category-invalid',
  ARTICLE_TAGS_LIMIT: 'article/tags-limit-exceeded',

  // Category Errors
  CATEGORY_NOT_FOUND: 'category/not-found',
  CATEGORY_INACTIVE: 'category/inactive',

  // Tag Errors
  TAG_NOT_FOUND: 'tag/not-found',
  TAG_NAME_REQUIRED: 'tag/name-required',
  TAG_ALREADY_EXISTS: 'tag/already-exists',

  // Search Errors
  SEARCH_QUERY_TOO_SHORT: 'search/query-too-short',
  SEARCH_NO_RESULTS: 'search/no-results'
}

// Predefined categories
const CATEGORIES = [
  { id: 'frontend', name: 'フロントエンド', slug: 'frontend', color: '#3B82F6', isActive: true, sortOrder: 1 },
  { id: 'backend', name: 'バックエンド', slug: 'backend', color: '#10B981', isActive: true, sortOrder: 2 },
  { id: 'mobile', name: 'モバイル', slug: 'mobile', color: '#8B5CF6', isActive: true, sortOrder: 3 },
  { id: 'devops', name: 'DevOps', slug: 'devops', color: '#F59E0B', isActive: true, sortOrder: 4 },
  { id: 'ai-ml', name: 'AI・機械学習', slug: 'ai-ml', color: '#EF4444', isActive: true, sortOrder: 5 },
  { id: 'security', name: 'セキュリティ', slug: 'security', color: '#6B7280', isActive: true, sortOrder: 6 },
  { id: 'other', name: 'その他', slug: 'other', color: '#94A3B8', isActive: true, sortOrder: 99 }
]

export function useArticles() {
  // Note: Remove SSR blocking to allow Firestore access on server-side
  // This enables article pages to load properly during SSR

  const { db } = useFirestore()
  const { user: currentUser } = useAuth()

  // State
  const articlesLoading = ref(false)
  const articlesError = ref(null)

  // Computed
  const loading = computed(() => articlesLoading.value)
  const error = computed(() => articlesError.value)

  // Clear error
  const clearError = () => {
    articlesError.value = null
  }

  // Set error
  const setError = (error) => {
    if (error?.code) {
      articlesError.value = {
        code: error.code,
        message: error.message
      }
    } else {
      articlesError.value = {
        code: 'article/unknown-error',
        message: error?.message || 'An unknown error occurred'
      }
    }
  }

  // Validate article data
  const validateArticle = async (articleData) => {
    if (!articleData.title || articleData.title.trim().length === 0) {
      throw { code: ArticleErrorCodes.ARTICLE_TITLE_REQUIRED, message: 'Title is required' }
    }

    if (!articleData.content || articleData.content.trim().length === 0) {
      throw { code: ArticleErrorCodes.ARTICLE_CONTENT_REQUIRED, message: 'Content is required' }
    }

    if (articleData.tags && articleData.tags.length > 5) {
      throw { code: ArticleErrorCodes.ARTICLE_TAGS_LIMIT, message: 'Maximum 5 tags allowed' }
    }

    if (articleData.categoryId) {
      const category = CATEGORIES.find(c => c.id === articleData.categoryId)
      if (!category) {
        throw { code: ArticleErrorCodes.CATEGORY_NOT_FOUND, message: 'Category not found' }
      }
      if (!category.isActive) {
        throw { code: ArticleErrorCodes.CATEGORY_INACTIVE, message: 'Category is inactive' }
      }
    }
  }

  // Calculate reading time
  const calculateReadingTime = (content) => {
    const wordsPerMinute = 200
    const wordCount = content.trim().split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }

  // Generate excerpt
  const generateExcerpt = (content, maxLength = 150) => {
    // Remove markdown syntax
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
      .replace(/```[^`]*```/g, '')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\n+/g, ' ')
      .trim()

    if (plainText.length <= maxLength) {
      return plainText
    }

    return plainText.substring(0, maxLength) + '...'
  }

  // Create article
  const createArticle = async (createRequest) => {
    try {
      clearError()
      articlesLoading.value = true

      if (!currentUser.value || !currentUser.value.uid || currentUser.value.uid === '[deleted]') {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      // Additional check to ensure user has a valid displayName (prevent anonymous posting)
      if (!currentUser.value.displayName || currentUser.value.displayName.trim() === '' || currentUser.value.displayName === 'Anonymous') {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Valid user profile required for posting' }
      }

      // Critical security check: require email verification for article posting
      if (!currentUser.value.emailVerified) {
        console.error('❌ Article creation denied: Email not verified', {
          uid: currentUser.value.uid,
          email: currentUser.value.email,
          emailVerified: currentUser.value.emailVerified
        })
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Email verification required for posting articles' }
      }

      console.log('✅ User authentication verified for article creation:', {
        uid: currentUser.value.uid,
        displayName: currentUser.value.displayName,
        emailVerified: currentUser.value.emailVerified
      })

      // Validate article
      await validateArticle(createRequest)

      const articleData = {
        ...createRequest,
        authorId: currentUser.value.uid,
        excerpt: generateExcerpt(createRequest.content),
        readingTime: calculateReadingTime(createRequest.content),
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: createRequest.isPublic ? new Date() : null
      }

      // Add article to Firestore
      const articlesCollection = collection(db, 'articles')
      const docRef = await addDoc(articlesCollection, articleData)

      // Update tag statistics
      if (createRequest.tags && createRequest.tags.length > 0) {
        const batch = writeBatch(db)
        for (const tag of createRequest.tags) {
          const tagDoc = doc(db, 'tags', tag)
          batch.set(tagDoc, {
            name: tag,
            slug: tag.toLowerCase().replace(/\s+/g, '-'),
            articleCount: increment(1),
            createdAt: new Date(),
            updatedAt: new Date()
          }, { merge: true })
        }
        await batch.commit()
      }

      // Update category statistics
      if (createRequest.categoryId) {
        console.log('📂 Updating category statistics for:', createRequest.categoryId)
        const categoryDoc = doc(db, 'categories', createRequest.categoryId)

        // Find category data from predefined categories
        const category = CATEGORIES.find(cat => cat.id === createRequest.categoryId)
        if (category) {
          console.log('📂 Found category:', category)

          // Check if category document exists
          const categorySnapshot = await getDoc(categoryDoc)

          if (!categorySnapshot.exists()) {
            // First time: create category with initial count
            await setDoc(categoryDoc, {
              ...category,
              articleCount: 1
            })
            console.log('📂 Category created with initial count')
          } else {
            // Already exists: just increment the count
            await updateDoc(categoryDoc, {
              articleCount: increment(1)
            })
            console.log('📂 Category articleCount incremented')
          }
        } else {
          console.warn('📂 Category not found in CATEGORIES:', createRequest.categoryId)
        }
      }

      // Get author information for response (same logic as getArticle)
      let author = null
      try {
        if (currentUser.value) {
          const authorDoc = doc(db, 'users', currentUser.value.uid)
          const authorSnapshot = await getDoc(authorDoc)
          if (authorSnapshot.exists()) {
            author = {
              uid: authorSnapshot.id,
              ...authorSnapshot.data()
            }
          } else {
            // If user document doesn't exist, create fallback from auth data
            author = {
              uid: currentUser.value.uid,
              displayName: currentUser.value.displayName || 'Anonymous',
              avatarUrl: currentUser.value.photoURL || null
            }
          }
        }
      } catch (authorError) {
        console.warn('⚠️ Failed to get author info for create response, using fallback:', authorError)
        author = {
          uid: currentUser.value.uid,
          displayName: currentUser.value.displayName || 'Anonymous',
          avatarUrl: currentUser.value.photoURL || null
        }
      }

      return {
        id: docRef.id,
        ...articleData,
        author
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get article
  const getArticle = async (articleId) => {
    try {
      clearError()
      articlesLoading.value = true

      console.log('🔍 Getting article:', articleId)
      console.log('🔍 useFirestore db instance:', db ? 'available' : 'not available')

      if (!db) {
        console.error('❌ Firestore db is null in useArticles')
        throw { code: 'FIRESTORE_NOT_AVAILABLE', message: 'Firestore database not available' }
      }

      console.log('🔍 Creating doc reference for:', articleId)
      const articleDoc = doc(db, 'articles', articleId)
      console.log('🔍 Article doc reference created:', articleDoc.path)

      console.log('🔍 Executing getDoc query...')
      const articleSnapshot = await getDoc(articleDoc)
      console.log('🔍 Article snapshot exists:', articleSnapshot.exists())

      if (!articleSnapshot.exists()) {
        console.log('❌ Article not found in Firestore:', articleId)
        throw { code: ArticleErrorCodes.ARTICLE_NOT_FOUND, message: 'Article not found' }
      }

      console.log('✅ Article found, processing data')

      const articleData = articleSnapshot.data()

      // Get author information (non-critical)
      let author = null
      try {
        if (articleData.authorId) {
          const authorDoc = doc(db, 'users', articleData.authorId)
          const authorSnapshot = await getDoc(authorDoc)
          if (authorSnapshot.exists()) {
            author = {
              uid: authorSnapshot.id,
              ...authorSnapshot.data()
            }
          }
        }
      } catch (authorError) {
        console.warn('⚠️ Failed to get author info, using fallback:', authorError)
        author = {
          uid: articleData.authorId,
          displayName: articleData.authorName || 'Unknown',
          avatarUrl: null
        }
      }

      // Check if current user liked this article (non-critical)
      let isLiked = false
      try {
        if (currentUser.value) {
          const likeDoc = doc(db, 'likes', `${currentUser.value.uid}_${articleId}`)
          const likeSnapshot = await getDoc(likeDoc)
          isLiked = likeSnapshot.exists()
        }
      } catch (likeError) {
        console.warn('⚠️ Failed to check like status:', likeError)
        isLiked = false
      }

      return {
        id: articleId,
        ...articleData,
        author,
        isLiked
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Update article
  const updateArticle = async (articleId, updateRequest) => {
    try {
      clearError()
      articlesLoading.value = true

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      // Check ownership
      const articleDoc = doc(db, 'articles', articleId)
      const articleSnapshot = await getDoc(articleDoc)

      if (!articleSnapshot.exists()) {
        throw { code: ArticleErrorCodes.ARTICLE_NOT_FOUND, message: 'Article not found' }
      }

      const article = articleSnapshot.data()
      if (article.authorId !== currentUser.value.uid) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Unauthorized to edit this article' }
      }

      // Validate update
      await validateArticle(updateRequest)

      const updateData = {
        ...updateRequest,
        excerpt: generateExcerpt(updateRequest.content),
        readingTime: calculateReadingTime(updateRequest.content),
        updatedAt: new Date()
      }

      if (updateRequest.isPublic && !article.publishedAt) {
        updateData.publishedAt = new Date()
      }

      await updateDoc(articleDoc, updateData)

      // Update tag statistics if tags changed
      if (updateRequest.tags) {
        const oldTags = article.tags || []
        const newTags = updateRequest.tags || []

        // Find tags that were removed
        const removedTags = oldTags.filter(tag => !newTags.includes(tag))
        // Find tags that were added
        const addedTags = newTags.filter(tag => !oldTags.includes(tag))

        console.log('🏷️ Tag changes - Removed:', removedTags, 'Added:', addedTags)

        // Only update counts if article is public
        if (updateRequest.isPublic) {
          const batch = writeBatch(db)

          // Decrement count for removed tags
          for (const tag of removedTags) {
            const tagDoc = doc(db, 'tags', tag)
            const tagSnapshot = await getDoc(tagDoc)
            if (tagSnapshot.exists()) {
              batch.update(tagDoc, {
                articleCount: increment(-1),
                updatedAt: new Date()
              })
              console.log('🏷️ Decrementing tag:', tag)
            }
          }

          // Increment count for added tags
          for (const tag of addedTags) {
            const tagDoc = doc(db, 'tags', tag)
            const tagSnapshot = await getDoc(tagDoc)
            if (tagSnapshot.exists()) {
              batch.update(tagDoc, {
                articleCount: increment(1),
                updatedAt: new Date()
              })
              console.log('🏷️ Incrementing existing tag:', tag)
            } else {
              // Create new tag
              batch.set(tagDoc, {
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-'),
                articleCount: 1,
                createdAt: new Date(),
                updatedAt: new Date()
              })
              console.log('🏷️ Creating new tag:', tag)
            }
          }

          await batch.commit()
          console.log('🏷️ Tag counts updated successfully')
        } else if (article.isPublic && !updateRequest.isPublic) {
          // Article changed from public to private: decrement all tags
          console.log('🏷️ Article became private, decrementing all tags')
          const batch = writeBatch(db)

          for (const tag of oldTags) {
            const tagDoc = doc(db, 'tags', tag)
            const tagSnapshot = await getDoc(tagDoc)
            if (tagSnapshot.exists()) {
              batch.update(tagDoc, {
                articleCount: increment(-1),
                updatedAt: new Date()
              })
            }
          }

          await batch.commit()
        } else if (!article.isPublic && updateRequest.isPublic) {
          // Article changed from private to public: increment all tags
          console.log('🏷️ Article became public, incrementing all tags')
          const batch = writeBatch(db)

          for (const tag of newTags) {
            const tagDoc = doc(db, 'tags', tag)
            const tagSnapshot = await getDoc(tagDoc)
            if (tagSnapshot.exists()) {
              batch.update(tagDoc, {
                articleCount: increment(1),
                updatedAt: new Date()
              })
            } else {
              // Create new tag
              batch.set(tagDoc, {
                name: tag,
                slug: tag.toLowerCase().replace(/\s+/g, '-'),
                articleCount: 1,
                createdAt: new Date(),
                updatedAt: new Date()
              })
            }
          }

          await batch.commit()
        }
      }

      // Update category statistics if category changed
      if (updateRequest.categoryId && article.categoryId !== updateRequest.categoryId) {
        console.log('📂 Category changed from', article.categoryId, 'to', updateRequest.categoryId)

        // Decrement old category count (only if it was public)
        if (article.isPublic && article.categoryId) {
          const oldCategoryDoc = doc(db, 'categories', article.categoryId)
          const oldCategorySnapshot = await getDoc(oldCategoryDoc)
          if (oldCategorySnapshot.exists()) {
            await updateDoc(oldCategoryDoc, {
              articleCount: increment(-1)
            })
            console.log('📂 Decremented old category:', article.categoryId)
          }
        }

        // Increment new category count (only if article is public)
        if (updateRequest.isPublic) {
          const newCategoryDoc = doc(db, 'categories', updateRequest.categoryId)
          const newCategorySnapshot = await getDoc(newCategoryDoc)

          if (!newCategorySnapshot.exists()) {
            // Category doesn't exist, create it
            const category = CATEGORIES.find(cat => cat.id === updateRequest.categoryId)
            if (category) {
              await setDoc(newCategoryDoc, {
                ...category,
                articleCount: 1
              })
              console.log('📂 Created new category with initial count:', updateRequest.categoryId)
            }
          } else {
            // Category exists, increment count
            await updateDoc(newCategoryDoc, {
              articleCount: increment(1)
            })
            console.log('📂 Incremented new category:', updateRequest.categoryId)
          }
        }
      } else if (article.categoryId && article.isPublic !== updateRequest.isPublic) {
        // Publication status changed but category didn't change
        console.log('📂 Publication status changed for category:', article.categoryId)

        const categoryDoc = doc(db, 'categories', article.categoryId)
        const categorySnapshot = await getDoc(categoryDoc)

        if (categorySnapshot.exists()) {
          if (updateRequest.isPublic && !article.isPublic) {
            // Changed from private to public: increment
            await updateDoc(categoryDoc, {
              articleCount: increment(1)
            })
            console.log('📂 Incremented category (private→public):', article.categoryId)
          } else if (!updateRequest.isPublic && article.isPublic) {
            // Changed from public to private: decrement
            await updateDoc(categoryDoc, {
              articleCount: increment(-1)
            })
            console.log('📂 Decremented category (public→private):', article.categoryId)
          }
        }
      }

      // Get author information (same logic as getArticle)
      let author = null
      try {
        if (article.authorId) {
          const authorDoc = doc(db, 'users', article.authorId)
          const authorSnapshot = await getDoc(authorDoc)
          if (authorSnapshot.exists()) {
            author = {
              uid: authorSnapshot.id,
              ...authorSnapshot.data()
            }
          }
        }
      } catch (authorError) {
        console.warn('⚠️ Failed to get author info for update response, using fallback:', authorError)
        author = {
          uid: article.authorId,
          displayName: article.authorName || 'Unknown',
          avatarUrl: null
        }
      }

      return {
        id: articleId,
        ...article,
        ...updateData,
        author
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Delete article
  const deleteArticle = async (articleId) => {
    try {
      clearError()
      articlesLoading.value = true

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      // Check ownership
      const articleDoc = doc(db, 'articles', articleId)
      const articleSnapshot = await getDoc(articleDoc)

      if (!articleSnapshot.exists()) {
        throw { code: ArticleErrorCodes.ARTICLE_NOT_FOUND, message: 'Article not found' }
      }

      const article = articleSnapshot.data()
      if (article.authorId !== currentUser.value.uid) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Unauthorized to delete this article' }
      }

      console.log('🗑️ Starting article deletion process for:', articleId)

      // Delete related data and article in a single batch
      const batch = writeBatch(db)

      try {
        // Delete all comments for this article
        console.log('🔍 Searching for comments to delete...')
        const commentsQuery = query(
          collection(db, 'comments'),
          where('articleId', '==', articleId)
        )
        const commentsSnapshot = await getDocs(commentsQuery)
        console.log(`📝 Found ${commentsSnapshot.docs.length} comments to delete`)

        commentsSnapshot.docs.forEach((commentDoc) => {
          console.log('🗑️ Queuing comment for deletion:', commentDoc.id)
          batch.delete(doc(db, 'comments', commentDoc.id))
        })

        // Delete all likes for this article
        console.log('🔍 Searching for likes to delete...')
        const likesQuery = query(
          collection(db, 'likes'),
          where('articleId', '==', articleId)
        )
        const likesSnapshot = await getDocs(likesQuery)
        console.log(`❤️ Found ${likesSnapshot.docs.length} likes to delete`)

        likesSnapshot.docs.forEach((likeDoc) => {
          console.log('🗑️ Queuing like for deletion:', likeDoc.id)
          batch.delete(doc(db, 'likes', likeDoc.id))
        })

      } catch (queryError) {
        console.error('❌ Error during related data query:', queryError)
        throw queryError
      }

      try {
        // Update tag statistics
        console.log('🏷️ Processing tag statistics...')
        if (article.tags && article.tags.length > 0) {
          console.log(`📊 Updating ${article.tags.length} tags:`, article.tags)
          for (const tag of article.tags) {
            const tagDoc = doc(db, 'tags', tag)
            // Check if tag document exists first
            const tagSnapshot = await getDoc(tagDoc)
            if (tagSnapshot.exists()) {
              batch.update(tagDoc, {
                articleCount: increment(-1)
              })
              console.log('📉 Queuing tag count decrement for existing tag:', tag)
            } else {
              console.log('⚠️ Tag document does not exist, skipping:', tag)
            }
          }
        } else {
          console.log('🏷️ No tags to update')
        }

        // Update category statistics
        console.log('📂 Processing category statistics...')
        if (article.categoryId) {
          console.log('📊 Updating category:', article.categoryId)
          const categoryDoc = doc(db, 'categories', article.categoryId)
          // Check if category document exists first
          const categorySnapshot = await getDoc(categoryDoc)
          if (categorySnapshot.exists()) {
            batch.update(categoryDoc, {
              articleCount: increment(-1)
            })
            console.log('📉 Queued category count decrement for existing category:', article.categoryId)
          } else {
            console.log('⚠️ Category document does not exist, skipping:', article.categoryId)
          }
        } else {
          console.log('📂 No category to update')
        }

        // Delete the article itself
        console.log('🗑️ Queuing article for deletion:', articleId)
        batch.delete(articleDoc)

        // Commit all operations
        console.log('💾 Committing batch operations...')
        await batch.commit()
        console.log('✅ Article deletion completed successfully')

      } catch (batchError) {
        console.error('❌ Error during batch operations:', batchError)
        throw batchError
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // List articles
  const listArticles = async (queryParams = {}) => {
    try {
      clearError()
      articlesLoading.value = true

      const {
        page = 1,
        limit: pageLimit = 20,
        categoryId,
        tags,
        sortBy = 'recent',
        isPublic = true,
        startAfter: startAfterDoc
      } = queryParams

      let constraints = []

      // Base constraints
      if (isPublic !== undefined) {
        constraints.push(where('isPublic', '==', isPublic))
      }

      if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId))
      }

      if (tags && tags.length > 0) {
        constraints.push(where('tags', 'array-contains-any', tags))
      }

      // Sorting
      switch (sortBy) {
        case 'popular':
          constraints.push(orderBy('likeCount', 'desc'))
          break
        case 'oldest':
          constraints.push(orderBy('publishedAt', 'asc'))
          break
        case 'newest':
        case 'recent':
        default:
          constraints.push(orderBy('publishedAt', 'desc'))
      }

      // Pagination cursor
      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc))
      }

      constraints.push(limit(pageLimit))

      const q = query(collection(db, 'articles'), ...constraints)
      const snapshot = await getDocs(q)

      const articles = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data()

          // Get author info
          let author = null
          if (data.authorId) {
            const authorDoc = await getDoc(doc(db, 'users', data.authorId))
            if (authorDoc.exists()) {
              author = {
                uid: authorDoc.id,
                displayName: authorDoc.data().displayName,
                avatarUrl: authorDoc.data().avatarUrl
              }
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            author
          }
        })
      )

      return {
        articles,
        total: articles.length,
        hasNext: snapshot.docs.length === pageLimit,
        nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get popular articles
  const getPopularArticles = async (pageLimit = 10) => {
    try {
      clearError()
      articlesLoading.value = true

      const q = query(
        collection(db, 'articles'),
        where('isPublic', '==', true),
        orderBy('likeCount', 'desc'),
        limit(pageLimit)
      )

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get recent articles
  const getRecentArticles = async (pageLimit = 10, lastDoc = null) => {
    try {
      clearError()
      articlesLoading.value = true

      let articles = []
      let lastDocument = null

      // Try with index first
      try {
        const constraints = [
          where('isPublic', '==', true),
          orderBy('publishedAt', 'desc'),
          limit(pageLimit)
        ]

        // Add pagination if lastDoc is provided
        if (lastDoc) {
          constraints.push(startAfter(lastDoc))
        }

        const q = query(collection(db, 'articles'), ...constraints)

        const snapshot = await getDocs(q)
        articles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Store the last document for pagination
        if (snapshot.docs.length > 0) {
          lastDocument = snapshot.docs[snapshot.docs.length - 1]
        }
      } catch (indexError) {
        // If index is not ready, fallback to simple query and filter client-side
        console.warn('Index not ready, using fallback query:', indexError.message)

        const constraints = [
          orderBy('publishedAt', 'desc'),
          limit(pageLimit * 2) // Get more to account for filtering
        ]

        if (lastDoc) {
          constraints.push(startAfter(lastDoc))
        }

        const q = query(collection(db, 'articles'), ...constraints)

        const snapshot = await getDocs(q)
        articles = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(article => article.isPublic === true)
          .slice(0, pageLimit)

        // Store the last document for pagination
        const publicDocs = snapshot.docs.filter(doc => doc.data().isPublic === true)
        if (publicDocs.length > 0) {
          lastDocument = publicDocs[Math.min(publicDocs.length - 1, pageLimit - 1)]
        }
      }

      // Get author information for each article
      const articlesWithAuthors = await Promise.all(
        articles.map(async (article) => {
          let author = null
          try {
            if (article.authorId) {
              const authorDoc = doc(db, 'users', article.authorId)
              const authorSnapshot = await getDoc(authorDoc)
              if (authorSnapshot.exists()) {
                author = {
                  uid: authorSnapshot.id,
                  ...authorSnapshot.data()
                }
              }
            }
          } catch (authorError) {
            console.warn('Failed to get author info:', authorError)
          }

          return {
            ...article,
            author
          }
        })
      )

      return {
        articles: articlesWithAuthors,
        lastDoc: lastDocument
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get articles by category
  const getArticlesByCategory = async (categoryId, pageLimit = 10, lastDoc = null) => {
    try {
      clearError()
      articlesLoading.value = true

      let articles = []
      let lastDocument = null

      // Try with composite index first
      try {
        const constraints = [
          where('categoryId', '==', categoryId),
          where('isPublic', '==', true),
          orderBy('publishedAt', 'desc'),
          limit(pageLimit)
        ]

        // Add pagination if lastDoc is provided
        if (lastDoc) {
          constraints.push(startAfter(lastDoc))
        }

        const q = query(collection(db, 'articles'), ...constraints)
        const snapshot = await getDocs(q)

        articles = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))

        // Store the last document for pagination
        if (snapshot.docs.length > 0) {
          lastDocument = snapshot.docs[snapshot.docs.length - 1]
        }
      } catch (indexError) {
        // If composite index is not ready, use fallback query
        console.warn('Composite index not ready, using fallback query:', indexError.message)

        const constraints = [
          where('categoryId', '==', categoryId),
          orderBy('publishedAt', 'desc'),
          limit(pageLimit * 2) // Get more to account for filtering
        ]

        if (lastDoc) {
          constraints.push(startAfter(lastDoc))
        }

        const q = query(collection(db, 'articles'), ...constraints)
        const snapshot = await getDocs(q)

        articles = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(article => article.isPublic === true)
          .slice(0, pageLimit)

        // Store the last document for pagination
        const publicDocs = snapshot.docs.filter(doc => doc.data().isPublic === true)
        if (publicDocs.length > 0) {
          lastDocument = publicDocs[Math.min(publicDocs.length - 1, pageLimit - 1)]
        }
      }

      // Get author information for each article
      const articlesWithAuthors = await Promise.all(
        articles.map(async (article) => {
          let author = null
          try {
            if (article.authorId) {
              const authorDoc = doc(db, 'users', article.authorId)
              const authorSnapshot = await getDoc(authorDoc)
              if (authorSnapshot.exists()) {
                author = {
                  uid: authorSnapshot.id,
                  ...authorSnapshot.data()
                }
              }
            }
          } catch (authorError) {
            console.warn('Failed to get author info:', authorError)
          }

          return {
            ...article,
            author
          }
        })
      )

      return {
        articles: articlesWithAuthors,
        lastDoc: lastDocument
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get user articles
  const getUserArticles = async (userId, queryParams = {}) => {
    try {
      clearError()
      articlesLoading.value = true

      const { page = 1, limit: pageLimit = 10, isPublic, startAfter: startAfterDoc } = queryParams

      let constraints = [
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc')
      ]

      if (isPublic !== undefined) {
        constraints.push(where('isPublic', '==', isPublic))
      }

      if (startAfterDoc) {
        constraints.push(startAfter(startAfterDoc))
      }

      constraints.push(limit(pageLimit))

      const q = query(collection(db, 'articles'), ...constraints)
      const snapshot = await getDocs(q)

      // Fetch author information for each article
      const articles = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data()

          // Get author information
          let author = null
          if (data.authorId) {
            try {
              const authorDoc = await getDoc(doc(db, 'users', data.authorId))
              if (authorDoc.exists()) {
                const authorData = authorDoc.data()
                author = {
                  uid: data.authorId,
                  displayName: authorData.displayName || 'Anonymous',
                  avatarUrl: authorData.avatarUrl || null,
                  bio: authorData.bio || null
                }
              }
            } catch (error) {
              console.warn('Failed to fetch author for article:', docSnapshot.id, error)
            }
          }

          return {
            id: docSnapshot.id,
            ...data,
            author
          }
        })
      )

      return {
        articles,
        total: articles.length,
        hasNext: snapshot.docs.length === pageLimit,
        nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Search articles
  const searchArticles = async (searchTerm, filters = {}) => {
    try {
      clearError()
      articlesLoading.value = true

      if (searchTerm.length < 2) {
        throw { code: ArticleErrorCodes.SEARCH_QUERY_TOO_SHORT, message: 'Search query must be at least 2 characters' }
      }

      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation - in production, consider using Algolia or similar
      const { categoryId, limit: pageLimit = 20 } = filters

      let constraints = [
        where('isPublic', '==', true),
        orderBy('title'),
        limit(pageLimit)
      ]

      if (categoryId) {
        constraints.push(where('categoryId', '==', categoryId))
      }

      const q = query(collection(db, 'articles'), ...constraints)
      const snapshot = await getDocs(q)

      // Client-side filtering for search term
      const articles = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(article =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (article.tags && article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        )

      if (articles.length === 0) {
        return {
          articles: [],
          total: 0,
          hasNext: false,
          message: 'No results found'
        }
      }

      return {
        articles,
        total: articles.length,
        hasNext: false
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // List categories
  const listCategories = async () => {
    try {
      clearError()

      // Get categories from Firestore (which includes articleCount)
      const categoriesSnapshot = await getDocs(collection(db, 'categories'))

      if (categoriesSnapshot.empty) {
        // If no categories in Firestore, return predefined ones
        console.log('📂 No categories in Firestore, returning defaults')
        return CATEGORIES
      }

      // Merge Firestore data with predefined categories
      const firestoreCategories = {}
      categoriesSnapshot.docs.forEach(doc => {
        firestoreCategories[doc.id] = doc.data()
        console.log(`📂 Category ${doc.id}:`, doc.data())
      })

      const result = CATEGORIES.map(category => ({
        ...category,
        articleCount: firestoreCategories[category.id]?.articleCount || 0
      }))

      console.log('📂 Final categories with counts:', result)
      return result
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Get category
  const getCategory = async (categoryId) => {
    try {
      clearError()

      const category = CATEGORIES.find(c => c.id === categoryId)
      if (!category) {
        throw { code: ArticleErrorCodes.CATEGORY_NOT_FOUND, message: 'Category not found' }
      }

      // Get article count for this category
      const q = query(
        collection(db, 'articles'),
        where('categoryId', '==', categoryId),
        where('isPublic', '==', true)
      )
      const snapshot = await getDocs(q)

      return {
        ...category,
        articleCount: snapshot.size
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // List tags
  const listTags = async (queryParams = {}) => {
    try {
      clearError()
      articlesLoading.value = true

      const { search = '', limit: pageLimit = 10 } = queryParams

      let constraints = [
        orderBy('articleCount', 'desc'),
        limit(pageLimit)
      ]

      const q = query(collection(db, 'tags'), ...constraints)
      const snapshot = await getDocs(q)

      let tags = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        name: doc.id,
        slug: doc.id,
        isActive: true,
        followCount: 0 // Would need to implement tag following
      }))

      // Client-side search filtering
      if (search) {
        tags = tags.filter(tag =>
          tag.name.toLowerCase().includes(search.toLowerCase())
        )
      }

      return tags
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Get tag
  const getTag = async (tagId) => {
    try {
      clearError()

      const tagDoc = doc(db, 'tags', tagId)
      const tagSnapshot = await getDoc(tagDoc)

      if (!tagSnapshot.exists()) {
        throw { code: ArticleErrorCodes.TAG_NOT_FOUND, message: 'Tag not found' }
      }

      return {
        id: tagId,
        name: tagId,
        slug: tagId,
        ...tagSnapshot.data(),
        followCount: 0 // Would need to implement tag following
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Create tag
  const createTag = async (createRequest) => {
    try {
      clearError()

      if (!createRequest.name || createRequest.name.trim().length === 0) {
        throw { code: ArticleErrorCodes.TAG_NAME_REQUIRED, message: 'Tag name is required' }
      }

      const tagId = createRequest.name.toLowerCase().replace(/\s+/g, '-')
      const tagDoc = doc(db, 'tags', tagId)

      // Check if tag already exists
      const existingTag = await getDoc(tagDoc)
      if (existingTag.exists()) {
        throw { code: ArticleErrorCodes.TAG_ALREADY_EXISTS, message: 'Tag already exists' }
      }

      const tagData = {
        name: createRequest.name,
        slug: tagId,
        description: createRequest.description || '',
        articleCount: 0,
        followCount: 0,
        isActive: true,
        createdAt: new Date()
      }

      await setDoc(tagDoc, tagData)

      return {
        id: tagId,
        ...tagData
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Get popular tags
  const getPopularTags = async (pageLimit = 20) => {
    try {
      clearError()

      console.log('🏷️ Fetching popular tags from Firestore...')

      const q = query(
        collection(db, 'tags'),
        orderBy('articleCount', 'desc'),
        limit(pageLimit)
      )

      const snapshot = await getDocs(q)
      console.log(`🏷️ Found ${snapshot.docs.length} tags in Firestore`)

      const tags = snapshot.docs.map(doc => {
        const data = doc.data()
        console.log(`🏷️ Tag ${doc.id}:`, data)
        return {
          id: doc.id,
          name: doc.id,
          slug: doc.id,
          ...data,
          followCount: 0 // Would need to implement tag following
        }
      })

      console.log('🏷️ Returning tags:', tags)
      return tags
    } catch (error) {
      console.error('❌ Failed to get popular tags:', error)
      setError(error)
      throw error
    }
  }

  // Like article
  const likeArticle = async (articleId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      const likeId = `${currentUser.value.uid}_${articleId}`
      const likeDoc = doc(db, 'likes', likeId)

      // Check if already liked
      const existingLike = await getDoc(likeDoc)
      if (existingLike.exists()) {
        return // Already liked
      }

      // Add like
      await setDoc(likeDoc, {
        userId: currentUser.value.uid,
        articleId: articleId,
        createdAt: new Date()
      })

      // Update article like count (non-critical operation)
      try {
        const articleDoc = doc(db, 'articles', articleId)
        await updateDoc(articleDoc, {
          likeCount: increment(1)
        })
        console.log('✅ Article like count updated for:', articleId)
      } catch (countError) {
        console.warn('⚠️ Failed to update article like count, but like was recorded:', countError)
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Unlike article
  const unlikeArticle = async (articleId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      const likeId = `${currentUser.value.uid}_${articleId}`
      const likeDocRef = doc(db, 'likes', likeId)

      // Check if liked
      const existingLike = await getDoc(likeDocRef)
      if (!existingLike.exists()) {
        return // Not liked
      }

      // Remove like
      await deleteDoc(likeDocRef)

      // Update article like count (non-critical operation)
      try {
        const articleDoc = doc(db, 'articles', articleId)
        await updateDoc(articleDoc, {
          likeCount: increment(-1)
        })
        console.log('✅ Article like count decremented for:', articleId)
      } catch (countError) {
        console.warn('⚠️ Failed to update article like count, but unlike was recorded:', countError)
      }
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Increment view count
  const incrementViewCount = async (articleId) => {
    try {
      clearError()

      const articleDoc = doc(db, 'articles', articleId)
      await updateDoc(articleDoc, {
        viewCount: increment(1)
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Delete multiple articles
  const deleteArticles = async (articleIds) => {
    try {
      clearError()
      articlesLoading.value = true

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      const batch = writeBatch(db)

      for (const articleId of articleIds) {
        const articleDoc = doc(db, 'articles', articleId)
        const articleSnapshot = await getDoc(articleDoc)

        if (articleSnapshot.exists()) {
          const article = articleSnapshot.data()

          // Check ownership
          if (article.authorId !== currentUser.value.uid) {
            throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: `Unauthorized to delete article ${articleId}` }
          }

          batch.delete(articleDoc)
        }
      }

      await batch.commit()
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Update articles category
  const updateArticlesCategory = async (articleIds, categoryId) => {
    try {
      clearError()
      articlesLoading.value = true

      if (!currentUser.value) {
        throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: 'Authentication required' }
      }

      // Validate category
      const category = CATEGORIES.find(c => c.id === categoryId)
      if (!category) {
        throw { code: ArticleErrorCodes.CATEGORY_NOT_FOUND, message: 'Category not found' }
      }

      const batch = writeBatch(db)

      for (const articleId of articleIds) {
        const articleDoc = doc(db, 'articles', articleId)
        const articleSnapshot = await getDoc(articleDoc)

        if (articleSnapshot.exists()) {
          const article = articleSnapshot.data()

          // Check ownership
          if (article.authorId !== currentUser.value.uid) {
            throw { code: ArticleErrorCodes.ARTICLE_UNAUTHORIZED, message: `Unauthorized to update article ${articleId}` }
          }

          batch.update(articleDoc, {
            categoryId,
            updatedAt: new Date()
          })
        }
      }

      await batch.commit()
    } catch (error) {
      setError(error)
      throw error
    } finally {
      articlesLoading.value = false
    }
  }

  // Initialize categories in Firestore
  const initializeCategories = async () => {
    try {
      if (!db) return

      const batch = writeBatch(db)
      for (const category of CATEGORIES) {
        const categoryDoc = doc(db, 'categories', category.id)
        const { articleCount: _, ...categoryWithoutCount } = category
        batch.set(categoryDoc, {
          ...categoryWithoutCount,
          articleCount: 0
        }, { merge: true })
      }
      await batch.commit()
      console.log('Categories initialized successfully')
    } catch (error) {
      console.error('Failed to initialize categories:', error)
    }
  }

  // Recalculate category counts from existing articles
  const recalculateCategoryCounts = async () => {
    try {
      console.log('🔄 Starting category count recalculation...')

      // Get all articles
      const articlesSnapshot = await getDocs(collection(db, 'articles'))
      const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      console.log(`📊 Found ${articles.length} total articles`)

      // Count articles by category
      const categoryCounts = {}
      CATEGORIES.forEach(cat => {
        categoryCounts[cat.id] = 0
      })

      articles.forEach(article => {
        if (article.isPublic && article.categoryId && categoryCounts[article.categoryId] !== undefined) {
          categoryCounts[article.categoryId]++
        }
      })

      console.log('📊 Category counts:', categoryCounts)

      // Update Firestore categories collection
      const batch = writeBatch(db)

      for (const category of CATEGORIES) {
        const categoryDoc = doc(db, 'categories', category.id)
        const { articleCount: _, ...categoryWithoutCount } = category
        batch.set(categoryDoc, {
          ...categoryWithoutCount,
          articleCount: categoryCounts[category.id]
        })
      }

      await batch.commit()

      console.log('✅ Category counts updated successfully!')

      // Display results
      CATEGORIES.forEach(cat => {
        console.log(`  ${cat.name}: ${categoryCounts[cat.id]} 記事`)
      })

      return categoryCounts
    } catch (error) {
      console.error('❌ Failed to recalculate category counts:', error)
      throw error
    }
  }

  // Recalculate tag counts from existing articles
  const recalculateTagCounts = async () => {
    try {
      console.log('🔄 Starting tag count recalculation...')

      // Get all articles
      const articlesSnapshot = await getDocs(collection(db, 'articles'))
      const articles = articlesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      console.log(`📊 Found ${articles.length} total articles`)

      // Count articles by tag
      const tagCounts = {}

      articles.forEach(article => {
        if (article.isPublic && article.tags && Array.isArray(article.tags)) {
          article.tags.forEach(tag => {
            if (tag) {
              tagCounts[tag] = (tagCounts[tag] || 0) + 1
            }
          })
        }
      })

      console.log('📊 Tag counts:', tagCounts)

      // Update Firestore tags collection
      const batch = writeBatch(db)

      for (const [tagName, count] of Object.entries(tagCounts)) {
        const tagDoc = doc(db, 'tags', tagName)
        batch.set(tagDoc, {
          name: tagName,
          slug: tagName.toLowerCase().replace(/\s+/g, '-'),
          articleCount: count,
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true })
      }

      await batch.commit()

      console.log('✅ Tag counts updated successfully!')

      // Display results
      Object.entries(tagCounts).forEach(([tag, count]) => {
        console.log(`  #${tag}: ${count} 記事`)
      })

      return tagCounts
    } catch (error) {
      console.error('❌ Failed to recalculate tag counts:', error)
      throw error
    }
  }

  return {
    // State
    loading,
    error,

    // Article CRUD
    createArticle,
    getArticle,
    updateArticle,
    deleteArticle,

    // Article Lists
    listArticles,
    getPopularArticles,
    getRecentArticles,
    getArticlesByCategory,
    getUserArticles,
    searchArticles,

    // Categories
    listCategories,
    getCategory,
    initializeCategories,
    recalculateCategoryCounts,
    recalculateTagCounts,

    // Tags
    listTags,
    getTag,
    createTag,
    getPopularTags,

    // Interactions
    likeArticle,
    unlikeArticle,
    incrementViewCount,

    // Bulk Operations
    deleteArticles,
    updateArticlesCategory,

    // Utils
    clearError
  }
}

// Export for use in API contract
export const articlesAPI = {
  createArticle: () => {},
  getArticle: () => {},
  updateArticle: () => {},
  deleteArticle: () => {},
  listArticles: () => {},
  getPopularArticles: () => {},
  getRecentArticles: () => {},
  getUserArticles: () => {},
  searchArticles: () => {},
  listCategories: () => {},
  getCategory: () => {},
  listTags: () => {},
  getTag: () => {},
  createTag: () => {},
  getPopularTags: () => {},
  likeArticle: () => {},
  unlikeArticle: () => {},
  incrementViewCount: () => {},
  deleteArticles: () => {},
  updateArticlesCategory: () => {}
}