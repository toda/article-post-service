export default defineNuxtRouteMiddleware((to, from) => {
  // サーバーサイドでのみ実行
  if (process.server) {
    const event = useRequestEvent()
    const authHeader = event.node.req.headers.authorization

    // Basic認証の認証情報
    const ADMIN_USERNAME = 'admin'
    const ADMIN_PASSWORD = 'admin123' // 本番環境では環境変数から取得してください

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // 認証ヘッダーがない場合
      event.node.res.statusCode = 401
      event.node.res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"')
      event.node.res.end('Unauthorized')
      return abortNavigation()
    }

    // Base64デコード
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8')
    const [username, password] = credentials.split(':')

    // 認証チェック
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      event.node.res.statusCode = 401
      event.node.res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"')
      event.node.res.end('Unauthorized')
      return abortNavigation()
    }
  }
})
