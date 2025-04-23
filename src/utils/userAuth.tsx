import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/utils/api'

// 定義 AuthContext 介面
export interface AuthContext {
  isAuthenticated: boolean
  login: (account: string, password: string) => Promise<void>
  logout: () => Promise<void>
  user: string | null
  loading: boolean // 新增 loading 狀態
}

// 建立 React Context
const AuthContext = React.createContext<AuthContext | null>(null)

// 取得目前登入使用者的 API
async function fetchUser(): Promise<string | null> {
  try {
    const response = await api.post('/v1/user/check-auth')
    // Debug: 印出 API 回傳內容
    // console.log('fetchUser response:', response.data)
    // 回傳使用者帳號
    return response.data.data?.account ?? null
  } catch (error) {
    // 失敗時回傳 null
    return null
  }
}

// 登入 API
export async function loginApi(account: string, password: string): Promise<string> {
  try {
    const response = await api.post('/v1/user/login', { account, password })
    return response.data.data.account as string
  } catch (error) {
    console.error('Login error:', error)
    throw new Error('Login failed')
  }
}

// 登出 API
async function logoutApi(): Promise<void> {
  try {
    await api.post('/v1/user/logout')
  } catch (error) {
    console.error('Logout error:', error)
    throw new Error('Logout failed')
  }
}

// AuthProvider 實作
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 私有 user 狀態，底線命名
  const [_user, _setUser] = React.useState<string | null>(null)
  // 私有 loading 狀態
  const [_loading, _setLoading] = React.useState<boolean>(true)
  // 判斷是否已驗證
  const isAuthenticated = !!_user

  // 只在元件掛載時檢查一次
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      _setLoading(true) // 開始 loading
      const userData = await fetchUser()
      _setUser(userData)
      _setLoading(false) // 結束 loading
    }
    
    checkAuthStatus()
  }, []) // 依賴陣列為空，僅執行一次

  // 登入 mutation
  const loginMutation = useMutation({
    mutationFn: async ({ account, password }: { account: string; password: string }) => {
      await loginApi(account, password)
      const userData = await fetchUser()
      return userData
    },
    onSuccess: (userData) => {
      _setUser(userData)
    },
  })

  // 登入方法
  const login = React.useCallback(
    async (account: string, password: string) => {
      await loginMutation.mutateAsync({ account, password })
    },
    [loginMutation]
  )

  // 登出方法
  const logout = React.useCallback(async () => {
    await logoutApi()
    _setUser(null)
  }, [])

  // 提供 context
  return (
    <AuthContext.Provider value={{ isAuthenticated, user: _user, login, logout, loading: _loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// useAuth hook
export function useAuth() {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
