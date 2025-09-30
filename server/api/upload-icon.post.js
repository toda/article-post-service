/**
 * Firebase Storage Upload Proxy API
 * 認証済みユーザーのみがアイコンをアップロードできるプロキシエンドポイント
 */

import { initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getStorage } from 'firebase-admin/storage'

let adminApp = null

// Firebase Admin の初期化
function getAdminApp() {
  if (!adminApp) {
    try {
      adminApp = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
      }, 'admin-upload')
    } catch (error) {
      if (error.code !== 'app/duplicate-app') {
        throw error
      }
    }
  }
  return adminApp
}

export default defineEventHandler(async (event) => {
  console.log('📤 Upload Icon API called')

  try {
    // Authorizationヘッダーからトークンを取得
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: '認証トークンが必要です'
      })
    }

    const idToken = authHeader.replace('Bearer ', '')

    // Firebase Admin SDK でトークンを検証
    const app = getAdminApp()
    const auth = getAuth(app)
    const decodedToken = await auth.verifyIdToken(idToken)

    if (!decodedToken.email_verified) {
      throw createError({
        statusCode: 403,
        statusMessage: 'メールアドレスの認証が必要です'
      })
    }

    // フォームデータを取得
    const formData = await readMultipartFormData(event)
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'フォームデータが見つかりません'
      })
    }

    // ファイルを抽出
    let file = null
    for (const field of formData) {
      if (field.name === 'file') {
        file = field
        break
      }
    }

    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ファイルが見つかりません'
      })
    }

    console.log('📤 Upload request:', {
      fileName: file.filename,
      fileSize: file.data.length,
      userId: decodedToken.uid
    })

    // ファイル名とパスを生成
    const fileExtension = file.filename?.split('.').pop() || 'jpg'
    const fileName = `icon.${fileExtension}`
    const filePath = `user-icons/${decodedToken.uid}/${fileName}`

    // Firebase Admin Storage を使用してアップロード
    const storage = getStorage(app)
    const bucket = storage.bucket()
    const fileRef = bucket.file(filePath)

    // ファイルをアップロード
    await fileRef.save(file.data, {
      metadata: {
        contentType: file.type || 'application/octet-stream',
        metadata: {
          uploadedBy: decodedToken.uid,
          uploadedAt: new Date().toISOString()
        }
      }
    })

    // ダウンロードURLを取得
    const [downloadURL] = await fileRef.getSignedUrl({
      action: 'read',
      expires: '03-09-2491' // 長期間有効なURL
    })

    console.log('✅ Upload successful via Firebase Admin SDK')

    return {
      success: true,
      downloadURL: downloadURL,
      filePath: filePath
    }

  } catch (error) {
    console.error('❌ Upload error:', error)

    if (error.code === 'auth/id-token-expired') {
      throw createError({
        statusCode: 401,
        statusMessage: '認証トークンが期限切れです'
      })
    }

    if (error.code === 'auth/id-token-revoked') {
      throw createError({
        statusCode: 401,
        statusMessage: '認証トークンが無効です'
      })
    }

    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'アップロードに失敗しました'
    })
  }
})