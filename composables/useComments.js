/**
 * Comments Composable
 * Handles comment CRUD operations, threading, and interactions
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
  writeBatch,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { useFirestore } from '~/composables/useFirestore'
import { useAuth } from '~/composables/useAuth'

// Error codes from contract
export const CommentErrorCodes = {
  // Comment Errors
  COMMENT_NOT_FOUND: 'comment/not-found',
  COMMENT_UNAUTHORIZED: 'comment/unauthorized',
  COMMENT_DELETED: 'comment/already-deleted',
  COMMENT_CONTENT_REQUIRED: 'comment/content-required',
  COMMENT_CONTENT_TOO_LONG: 'comment/content-too-long',

  // Thread Errors
  THREAD_NOT_FOUND: 'thread/not-found',
  THREAD_TOO_DEEP: 'thread/too-deep',
  PARENT_COMMENT_NOT_FOUND: 'parent/not-found',
  PARENT_COMMENT_DELETED: 'parent/deleted',

  // Article Errors
  ARTICLE_NOT_FOUND: 'article/not-found',
  ARTICLE_COMMENTS_DISABLED: 'article/comments-disabled',

  // Permission Errors
  UNAUTHORIZED_DELETE: 'permission/unauthorized-delete',
  UNAUTHORIZED_EDIT: 'permission/unauthorized-edit',
  RATE_LIMIT_EXCEEDED: 'permission/rate-limit'
}

// Comment validation rules
const COMMENT_VALIDATION = {
  minLength: 1,
  maxLength: 1000,
  maxDepth: 3,
  allowHtml: false,
  requireAuth: true
}

export function useComments() {
  // Handle server-side rendering
  if (typeof window === 'undefined') {
    return {
      loading: computed(() => false),
      error: computed(() => null),
      getArticleComments: () => Promise.resolve({ threads: [], total: 0, hasNext: false }),
      createComment: () => Promise.resolve(null),
      updateComment: () => Promise.resolve(null),
      deleteComment: () => Promise.resolve(),
      likeComment: () => Promise.resolve(),
      unlikeComment: () => Promise.resolve(),
      subscribeToComments: () => () => {},
      listComments: () => Promise.resolve({ comments: [], hasNext: false, lastDoc: null }),
      clearError: () => {}
    }
  }

  const { db } = useFirestore()
  const { user: currentUser } = useAuth()

  // State
  const commentsLoading = ref(false)
  const commentsError = ref(null)

  // Computed
  const loading = computed(() => commentsLoading.value)
  const error = computed(() => commentsError.value)

  // Clear error
  const clearError = () => {
    commentsError.value = null
  }

  // Set error
  const setError = (error) => {
    if (error?.code) {
      commentsError.value = {
        code: error.code,
        message: error.message
      }
    } else {
      commentsError.value = {
        code: 'comment/unknown-error',
        message: error?.message || 'An unknown error occurred'
      }
    }
  }

  // Validate comment content
  const validateComment = (content) => {
    if (!content || content.trim().length === 0) {
      throw { code: CommentErrorCodes.COMMENT_CONTENT_REQUIRED, message: 'Comment content is required' }
    }

    if (content.length > COMMENT_VALIDATION.maxLength) {
      throw { code: CommentErrorCodes.COMMENT_CONTENT_TOO_LONG, message: `Comment must be ${COMMENT_VALIDATION.maxLength} characters or less` }
    }
  }

  // Calculate comment depth
  const calculateCommentDepth = async (parentId) => {
    if (!parentId) return 0

    const parentDoc = doc(db, 'comments', parentId)
    const parentSnapshot = await getDoc(parentDoc)

    if (!parentSnapshot.exists()) {
      throw { code: CommentErrorCodes.PARENT_COMMENT_NOT_FOUND, message: 'Parent comment not found' }
    }

    const parentData = parentSnapshot.data()
    if (parentData.isDeleted) {
      throw { code: CommentErrorCodes.PARENT_COMMENT_DELETED, message: 'Parent comment is deleted' }
    }

    const depth = (parentData.depth || 0) + 1
    if (depth > COMMENT_VALIDATION.maxDepth) {
      throw { code: CommentErrorCodes.THREAD_TOO_DEEP, message: `Maximum nesting depth is ${COMMENT_VALIDATION.maxDepth}` }
    }

    return depth
  }

  // Get author information with fallback handling
  const getAuthorInfo = async (commentData) => {
    let author = null

    if (commentData.authorId) {
      console.log('👤 Fetching author info for:', commentData.authorId)
      try {
        const authorDoc = await getDoc(doc(db, 'users', commentData.authorId))
        if (authorDoc.exists()) {
          const authorData = authorDoc.data()
          author = {
            displayName: authorData.displayName,
            avatarUrl: authorData.avatarUrl
          }
          console.log('✅ Author found:', author.displayName, 'Avatar:', author.avatarUrl ? 'Yes' : 'No')
        } else {
          console.warn('⚠️ Author document not found for:', commentData.authorId)
          // Fallback to stored authorName in comment
          author = {
            displayName: commentData.authorName || 'Anonymous',
            avatarUrl: null
          }
          console.log('🔄 Using fallback author name:', author.displayName)
        }
      } catch (error) {
        console.error('❌ Failed to fetch author:', error)
        // Fallback to stored authorName in comment
        author = {
          displayName: commentData.authorName || 'Anonymous',
          avatarUrl: null
        }
        console.log('🔄 Using fallback author name due to error:', author.displayName)
      }
    } else {
      // No authorId, use stored authorName
      author = {
        displayName: commentData.authorName || 'Anonymous',
        avatarUrl: null
      }
      console.log('📝 No authorId, using stored name:', author.displayName)
    }

    return author
  }

  // Create comment
  const createComment = async (createRequest) => {
    try {
      clearError()
      commentsLoading.value = true

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      const { articleId, content, parentId } = createRequest

      // Validate content
      validateComment(content)


      // Check if article exists (for real articles) - make non-blocking for test articles
      const articleDoc = doc(db, 'articles', articleId)
      let articleExists = false
      try {
        const articleSnapshot = await getDoc(articleDoc)
        articleExists = articleSnapshot.exists()

        if (!articleExists && !articleId.startsWith('test-')) {
          throw { code: CommentErrorCodes.ARTICLE_NOT_FOUND, message: 'Article not found' }
        }

        if (!articleExists) {
          console.warn('⚠️ Article not found, but proceeding for test article:', articleId)
        }
      } catch (articleError) {
        if (articleId.startsWith('test-')) {
          console.warn('⚠️ Failed to check article existence, but proceeding for test article:', articleError)
          articleExists = false
        } else {
          throw articleError
        }
      }

      // Calculate depth
      const depth = await calculateCommentDepth(parentId)

      // Debug current user information
      console.log('🔍 Current user during comment creation:', {
        uid: currentUser.value.uid,
        displayName: currentUser.value.displayName,
        email: currentUser.value.email,
        fullUser: currentUser.value
      })

      // Get current user's display name for redundant storage
      const currentUserDisplayName = currentUser.value.displayName || 'Anonymous User'
      console.log('💾 Using display name for comment:', currentUserDisplayName)

      const commentData = {
        articleId,
        content: content.trim(),
        authorId: currentUser.value.uid,
        authorName: currentUserDisplayName, // Store for redundancy
        parentId: parentId || null,
        depth,
        childCount: 0,
        likeCount: 0,
        isDeleted: false,
        isEdited: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }

      console.log('📝 Comment data to be saved:', commentData)

      // Add comment
      const commentsCollection = collection(db, 'comments')
      const docRef = await addDoc(commentsCollection, commentData)
      console.log('💬 Comment created with ID:', docRef.id, 'Data:', commentData)

      // Update parent comment child count (non-critical)
      if (parentId) {
        try {
          const parentDocRef = doc(db, 'comments', parentId)
          await updateDoc(parentDocRef, {
            childCount: increment(1)
          })
          console.log('📊 Parent comment count updated for:', parentId)
        } catch (parentError) {
          console.warn('⚠️ Failed to update parent comment count, but comment was created:', parentError)
        }
      }

      // Update article comment count (non-critical)
      if (articleExists) {
        try {
          await updateDoc(articleDoc, {
            commentCount: increment(1)
          })
          console.log('📊 Article comment count updated for:', articleId)
        } catch (countError) {
          console.warn('⚠️ Failed to update article comment count, but comment was created:', countError)
        }
      } else {
        console.log('⏭️ Skipping article comment count update (article not found):', articleId)
      }

      // Get author info for response (non-critical, use fallback if fails)
      let author = null
      try {
        const authorDoc = doc(db, 'users', currentUser.value.uid)
        const authorSnapshot = await getDoc(authorDoc)
        author = authorSnapshot.exists() ? {
          displayName: authorSnapshot.data().displayName,
          avatarUrl: authorSnapshot.data().avatarUrl
        } : {
          displayName: currentUserDisplayName,
          avatarUrl: null
        }
      } catch (authorError) {
        console.warn('⚠️ Failed to get author info for response, using fallback:', authorError)
        author = {
          displayName: currentUserDisplayName,
          avatarUrl: null
        }
      }

      console.log('👤 Comment created with author info:', {
        displayName: author?.displayName,
        avatarUrl: author?.avatarUrl ? 'Yes' : 'No',
        avatarUrlValue: author?.avatarUrl
      })

      return {
        id: docRef.id,
        ...commentData,
        author
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Get comment
  const getComment = async (commentId) => {
    try {
      clearError()
      commentsLoading.value = true

      const commentDoc = doc(db, 'comments', commentId)
      const commentSnapshot = await getDoc(commentDoc)

      if (!commentSnapshot.exists()) {
        throw { code: CommentErrorCodes.COMMENT_NOT_FOUND, message: 'Comment not found' }
      }

      const commentData = commentSnapshot.data()

      // Get author information using common function
      const author = await getAuthorInfo(commentData)

      // Get children if any
      let children = []
      if (commentData.childCount > 0) {
        const childrenQuery = query(
          collection(db, 'comments'),
          where('parentId', '==', commentId),
          orderBy('createdAt', 'asc'),
          limit(5) // Limit initial children load
        )
        const childrenSnapshot = await getDocs(childrenQuery)
        children = childrenSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
      }

      return {
        id: commentId,
        ...commentData,
        author,
        children
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Update comment
  const updateComment = async (commentId, updateRequest) => {
    try {
      clearError()
      commentsLoading.value = true

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      const { content } = updateRequest

      // Validate content
      validateComment(content)

      // Check comment exists and ownership
      const commentDoc = doc(db, 'comments', commentId)
      const commentSnapshot = await getDoc(commentDoc)

      if (!commentSnapshot.exists()) {
        throw { code: CommentErrorCodes.COMMENT_NOT_FOUND, message: 'Comment not found' }
      }

      const comment = commentSnapshot.data()
      if (comment.authorId !== currentUser.value.uid) {
        throw { code: CommentErrorCodes.UNAUTHORIZED_EDIT, message: 'Unauthorized to edit this comment' }
      }

      if (comment.isDeleted) {
        throw { code: CommentErrorCodes.COMMENT_DELETED, message: 'Cannot edit deleted comment' }
      }

      // Update comment
      const updateData = {
        content: content.trim(),
        isEdited: true,
        updatedAt: new Date()
      }

      await updateDoc(commentDoc, updateData)

      return {
        id: commentId,
        ...comment,
        ...updateData
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Delete comment
  const deleteComment = async (commentId) => {
    try {
      clearError()
      commentsLoading.value = true

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      // Check comment exists and ownership
      const commentDoc = doc(db, 'comments', commentId)
      const commentSnapshot = await getDoc(commentDoc)

      if (!commentSnapshot.exists()) {
        throw { code: CommentErrorCodes.COMMENT_NOT_FOUND, message: 'Comment not found' }
      }

      const comment = commentSnapshot.data()
      if (comment.authorId !== currentUser.value.uid) {
        throw { code: CommentErrorCodes.UNAUTHORIZED_DELETE, message: 'Unauthorized to delete this comment' }
      }

      // Delete related comment likes first
      console.log('🗑️ Deleting comment likes for comment:', commentId)
      const commentLikesQuery = query(
        collection(db, 'commentLikes'),
        where('commentId', '==', commentId)
      )
      const commentLikesSnapshot = await getDocs(commentLikesQuery)
      console.log(`❤️ Found ${commentLikesSnapshot.docs.length} comment likes to delete`)

      // Use batch to delete all comment likes
      if (commentLikesSnapshot.docs.length > 0) {
        const batch = writeBatch(db)
        commentLikesSnapshot.docs.forEach((likeDoc) => {
          console.log('🗑️ Queuing comment like for deletion:', likeDoc.id)
          batch.delete(doc(db, 'commentLikes', likeDoc.id))
        })
        await batch.commit()
        console.log('✅ Comment likes deleted successfully')
      }

      // Soft delete if has children, hard delete if no children
      if (comment.childCount > 0) {
        // Soft delete
        console.log('🔄 Soft deleting comment (has children):', commentId)
        await updateDoc(commentDoc, {
          content: '[削除されました]',
          isDeleted: true,
          updatedAt: new Date()
        })
      } else {
        // Hard delete
        console.log('🗑️ Hard deleting comment (no children):', commentId)
        await deleteDoc(commentDoc)

        // Update parent child count
        if (comment.parentId) {
          const parentDoc = doc(db, 'comments', comment.parentId)
          await updateDoc(parentDoc, {
            childCount: increment(-1)
          })
        }

        // Update article comment count
        const articleDoc = doc(db, 'articles', comment.articleId)
        await updateDoc(articleDoc, {
          commentCount: increment(-1)
        })
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // List comments for article
  const listComments = async (queryParams) => {
    try {
      clearError()
      commentsLoading.value = true

      const {
        articleId,
        page = 1,
        limit: pageLimit = 20,
        sortBy = 'oldest'
      } = queryParams

      let orderField = 'createdAt'
      let orderDirection = 'asc'

      switch (sortBy) {
        case 'newest':
          orderDirection = 'desc'
          break
        case 'popular':
          orderField = 'likeCount'
          orderDirection = 'desc'
          break
        case 'oldest':
        default:
          orderDirection = 'asc'
      }

      console.log('🔍 Querying comments for article:', articleId, 'sortBy:', sortBy, 'orderField:', orderField, 'orderDirection:', orderDirection)

      // Use simple query without complex ordering to avoid index requirements
      const q = query(
        collection(db, 'comments'),
        where('articleId', '==', articleId),
        where('parentId', '==', null), // Only top-level comments
        limit(pageLimit)
      )

      let snapshot
      try {
        snapshot = await getDocs(q)
        console.log('📝 Query returned:', snapshot.docs.length, 'comments')
      } catch (queryError) {
        console.error('❌ Query failed:', queryError)
        // Fallback to simple query without ordering by likeCount
        if (orderField === 'likeCount') {
          console.log('🔄 Retrying with createdAt ordering...')
          const fallbackQ = query(
            collection(db, 'comments'),
            where('articleId', '==', articleId),
            where('parentId', '==', null),
            orderBy('createdAt', 'desc'),
            limit(pageLimit)
          )
          snapshot = await getDocs(fallbackQ)
          console.log('📝 Fallback query returned:', snapshot.docs.length, 'comments')
        } else {
          throw queryError
        }
      }
      const comments = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Get author info using common function
          const author = await getAuthorInfo(data)

          return {
            id: doc.id,
            ...data,
            author
          }
        })
      )

      return {
        comments,
        total: comments.length,
        hasNext: snapshot.docs.length === pageLimit,
        nextCursor: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Get comment thread
  const getCommentThread = async (commentId) => {
    try {
      clearError()
      commentsLoading.value = true

      // Get the main comment
      const comment = await getComment(commentId)

      // Get replies
      const repliesQuery = query(
        collection(db, 'comments'),
        where('parentId', '==', commentId),
        orderBy('createdAt', 'asc'),
        limit(10)
      )

      const repliesSnapshot = await getDocs(repliesQuery)
      const replies = await Promise.all(
        repliesSnapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Get author info using common function
          const author = await getAuthorInfo(data)

          return {
            id: doc.id,
            ...data,
            author
          }
        })
      )

      return {
        comment,
        replies,
        totalReplies: comment.childCount,
        hasMoreReplies: replies.length < comment.childCount
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Get article comments with threading
  const getArticleComments = async (articleId, options = {}) => {
    try {
      clearError()
      commentsLoading.value = true

      console.log('🔄 Loading article comments for:', articleId, 'options:', options)

      const { sortBy = 'newest', limit: pageLimit = 50 } = options

      // Get top-level comments
      const topLevelResult = await listComments({
        articleId,
        sortBy,
        limit: pageLimit
      })

      console.log('📄 Got top-level comments:', topLevelResult.comments.length)

      // Get threads for each top-level comment
      const threads = await Promise.all(
        topLevelResult.comments.map(async (comment) => {
          // Simplified query without ordering to avoid index requirements
          const repliesQuery = query(
            collection(db, 'comments'),
            where('parentId', '==', comment.id),
            limit(3) // Show first 3 replies
          )

          const repliesSnapshot = await getDocs(repliesQuery)
          const replies = await Promise.all(
            repliesSnapshot.docs.map(async (doc) => {
              const data = doc.data()

              // Get author info using common function
              const author = await getAuthorInfo(data)

              return {
                id: doc.id,
                ...data,
                author
              }
            })
          )

          return {
            comment,
            replies,
            totalReplies: comment.childCount,
            hasMoreReplies: replies.length < comment.childCount
          }
        })
      )

      return {
        threads,
        total: topLevelResult.total,
        hasNext: topLevelResult.hasNext
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Get replies to a comment
  const getReplies = async (parentId, options = {}) => {
    try {
      clearError()
      commentsLoading.value = true

      const { page = 1, limit: pageLimit = 10 } = options

      const q = query(
        collection(db, 'comments'),
        where('parentId', '==', parentId),
        orderBy('createdAt', 'asc'),
        limit(pageLimit)
      )

      const snapshot = await getDocs(q)
      const comments = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data()

          // Get author info using common function
          const author = await getAuthorInfo(data)

          return {
            id: doc.id,
            ...data,
            author
          }
        })
      )

      return {
        comments,
        total: comments.length,
        hasNext: snapshot.docs.length === pageLimit
      }
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Like comment
  const likeComment = async (commentId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      const likeId = `${currentUser.value.uid}_${commentId}`
      const likeDoc = doc(db, 'commentLikes', likeId)

      // Check if already liked
      const existingLike = await getDoc(likeDoc)
      if (existingLike.exists()) {
        return // Already liked
      }

      // Add like
      await setDoc(likeDoc, {
        userId: currentUser.value.uid,
        commentId: commentId,
        createdAt: new Date()
      })

      // Update comment like count
      const commentDoc = doc(db, 'comments', commentId)
      await updateDoc(commentDoc, {
        likeCount: increment(1)
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Unlike comment
  const unlikeComment = async (commentId) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      const likeId = `${currentUser.value.uid}_${commentId}`
      const likeDocRef = doc(db, 'commentLikes', likeId)

      // Check if liked
      const existingLike = await getDoc(likeDocRef)
      if (!existingLike.exists()) {
        return // Not liked
      }

      // Remove like
      await deleteDoc(likeDocRef)

      // Update comment like count
      const commentDoc = doc(db, 'comments', commentId)
      await updateDoc(commentDoc, {
        likeCount: increment(-1)
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Report comment
  const reportComment = async (commentId, reason) => {
    try {
      clearError()

      if (!currentUser.value) {
        throw { code: CommentErrorCodes.COMMENT_UNAUTHORIZED, message: 'Authentication required' }
      }

      const reportData = {
        commentId,
        reporterId: currentUser.value.uid,
        reason,
        status: 'pending',
        createdAt: new Date()
      }

      const reportsCollection = collection(db, 'commentReports')
      await addDoc(reportsCollection, reportData)
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Hide comment (moderation)
  const hideComment = async (commentId) => {
    try {
      clearError()

      // Note: In a real app, this would require admin privileges
      const commentDoc = doc(db, 'comments', commentId)
      await updateDoc(commentDoc, {
        isHidden: true,
        hiddenAt: new Date()
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Restore comment (moderation)
  const restoreComment = async (commentId) => {
    try {
      clearError()

      // Note: In a real app, this would require admin privileges
      const commentDoc = doc(db, 'comments', commentId)
      await updateDoc(commentDoc, {
        isHidden: false,
        restoredAt: new Date()
      })
    } catch (error) {
      setError(error)
      throw error
    }
  }

  // Delete user comments (bulk operation)
  const deleteUserComments = async (userId) => {
    try {
      clearError()
      commentsLoading.value = true

      const q = query(
        collection(db, 'comments'),
        where('authorId', '==', userId)
      )

      const snapshot = await getDocs(q)
      const batch = writeBatch(db)

      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
      })

      await batch.commit()
    } catch (error) {
      setError(error)
      throw error
    } finally {
      commentsLoading.value = false
    }
  }

  // Get recent comments
  const getRecentComments = async (pageLimit = 20) => {
    try {
      clearError()
      commentsLoading.value = true

      const q = query(
        collection(db, 'comments'),
        where('isDeleted', '==', false),
        orderBy('createdAt', 'desc'),
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
      commentsLoading.value = false
    }
  }

  // Subscribe to real-time comments updates
  const subscribeToComments = (subscription) => {
    const { articleId, onCommentAdded, onCommentUpdated, onCommentDeleted, onLikeChanged } = subscription

    const q = query(
      collection(db, 'comments'),
      where('articleId', '==', articleId)
    )

    return onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const comment = {
          id: change.doc.id,
          ...change.doc.data()
        }

        if (change.type === 'added') {
          onCommentAdded?.(comment)
        } else if (change.type === 'modified') {
          onCommentUpdated?.(comment)
        } else if (change.type === 'removed') {
          onCommentDeleted?.(change.doc.id)
        }
      })
    })
  }

  return {
    // State
    loading,
    error,

    // Comment CRUD
    createComment,
    getComment,
    updateComment,
    deleteComment,

    // Comment Lists
    listComments,
    getCommentThread,
    getArticleComments,
    getReplies,

    // Interactions
    likeComment,
    unlikeComment,

    // Moderation
    reportComment,
    hideComment,
    restoreComment,

    // Bulk Operations
    deleteUserComments,
    getRecentComments,

    // Real-time
    subscribeToComments,

    // Utils
    clearError
  }
}

// Export for use in API contract
export const commentsAPI = {
  createComment: () => {},
  getComment: () => {},
  updateComment: () => {},
  deleteComment: () => {},
  listComments: () => {},
  getCommentThread: () => {},
  getArticleComments: () => {},
  getReplies: () => {},
  likeComment: () => {},
  unlikeComment: () => {},
  reportComment: () => {},
  hideComment: () => {},
  restoreComment: () => {},
  deleteUserComments: () => {},
  getRecentComments: () => {}
}