import axios from 'axios'

// 創建 axios 實例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/v1',
  timeout: 10000,
  withCredentials: true, // 允許攜帶憑證（cookies）
  headers: {
    'Content-Type': 'application/json'
  }
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 可以在這裡添加 token 或其他請求頭
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 處理錯誤響應
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // 未授權，清除登入狀態並導向登入頁
          console.error('未授權，請重新登入')
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
        case 403:
          console.error('沒有權限訪問')
          break
        case 404:
          console.error('請求的資源不存在')
          break
        case 500:
          console.error('伺服器錯誤')
          break
        default:
          console.error('請求失敗：', error.response.data?.message || error.message)
      }
    } else if (error.request) {
      console.error('無法連接到伺服器')
    } else {
      console.error('請求錯誤：', error.message)
    }
    return Promise.reject(error)
  }
)

export default api
