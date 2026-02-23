import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { 
  login as apiLogin, 
  logout as apiLogout, 
  checkAuth as apiCheckAuth,
  getCurrentUser,
  type LoginCredentials
} from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter()
  
  // State
  const user = ref(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null)
  const token = ref(localStorage.getItem('token') || null)

  // Getters
  const isAuthenticated = computed(() => !!token.value && checkAuth())
  const userName = computed(() => user.value?.name || user.value?.account || '')

  // Actions
  const login = async (credentials: LoginCredentials) => {
    try {
      const response: any = await apiLogin(credentials)
      
      console.log('Login API Response:', response)
      
      // Handle token (可能在 response.token 或 response.data.token)
      const responseToken = response?.token || response?.data?.token
      if (responseToken) {
        token.value = responseToken
        localStorage.setItem('token', responseToken)
        console.log('Token saved:', responseToken)
      } else {
        console.warn('Token not found in API response:', response)
      }
      
      // Handle user information (可能在 response.user 或 response.data.user 或 response.data)
      await fetchUser()
      
      return response
    } catch (error) {
      console.error('登入錯誤:', error)
      throw error
    }
  }

  const checkAuth = () => {
    if (!token.value) return false

    try {
      apiCheckAuth()
      return true
    } catch (error: any) {
      console.error('Token 驗證失敗:', error)
      clearAuth()
      return false
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
      router.push('/login')
    } catch (error) {
      console.error('登出 API 失敗:', error)
    } finally {
      // 無論 API 是否成功，都清除本地資料
      clearAuth()
    }
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const fetchUser = async () => {
    if (!token.value) return
    
    try {
      const userData = await getCurrentUser()
      user.value = userData.data
      
      localStorage.setItem('user', JSON.stringify(userData.data))
    } catch (error: any) {
      console.error('獲取用戶資訊失敗:', error)
      // 如果 token 無效，清除認證狀態
      if (error.response?.status === 401) {
        clearAuth()
      }
    }
  }

  const initAuth = () => {
    // 從 localStorage 恢復狀態
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken) {
      token.value = savedToken
      
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (error) {
          console.error('解析用戶資訊失敗:', error)
        }
      }
      
      // 驗證 token 是否有效並獲取最新用戶資訊
      fetchUser()
    }
  }

  return {
    // State
    user,
    token,
    
    // Getters
    isAuthenticated,
    userName,
    
    // Actions
    login,
    checkAuth,
    logout,
    clearAuth,
    fetchUser,
    initAuth
  }
})
