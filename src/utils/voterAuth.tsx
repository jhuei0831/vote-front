import * as React from 'react'
import { useMutation } from '@tanstack/react-query'
import api from '@/utils/api'

// 定義Voter介面
export interface Voter {
  id: string
  voterId: string
  isVoted: boolean
}

// 定義 VoterAuthContext 介面
export interface VoterAuthContext {
  isAuthenticated: boolean
  login: (voterId: string, password: string) => Promise<void>
  logout: () => Promise<void>
  voter: string | null
  isVoted: boolean
  loading: boolean // loading 狀態
}

// 建立 React Context
const VoterAuthContext = React.createContext<VoterAuthContext | null>(null)

// 取得目前登入投票者的 API
async function fetchVoter(): Promise<Voter | null> {
  try {
    const response = await api.post('/v1/voter/check-auth')
    // 回傳投票者帳號
    return response.data.data ?? null
  } catch (error) {
    // 失敗時回傳 null
    return null
  }
}

// 登入 API
export async function voterLoginApi(voterId: string, password: string): Promise<string> {
  try {
    const response = await api.post('/v1/voter/login', { voterId, password })
    return response.data.data.voterId as string
  } catch (error) {
    console.error('Voter login error:', error)
    throw new Error('Voter login failed')
  }
}

// 登出 API
async function voterLogoutApi(): Promise<void> {
  try {
    await api.post('/v1/voter/logout')
  } catch (error) {
    console.error('Voter logout error:', error)
    throw new Error('Voter logout failed')
  }
}

// VoterAuthProvider 實作
export function VoterAuthProvider({ children }: { children: React.ReactNode }) {
  // 私有 voter 狀態，底線命名
  const [_voter, _setVoter] = React.useState<string | null>(null)
  // 私有 isVoted 狀態
  const [_isVoted, _setIsVoted] = React.useState<boolean>(false)
  // 私有 loading 狀態
  const [_loading, _setLoading] = React.useState<boolean>(true)
  // 判斷是否已驗證
  const isAuthenticated = !!_voter

  // 只在元件掛載時檢查一次
  React.useEffect(() => {
    const checkAuthStatus = async () => {
      _setLoading(true) // 開始 loading
      const voterData = await fetchVoter()
      console.log(voterData);
      
      _setVoter(voterData?.id || null)
      _setIsVoted(voterData?.isVoted || false)
      _setLoading(false) // 結束 loading
    }
    checkAuthStatus()
  }, [])

  // 登入 mutation
  const loginMutation = useMutation({
    mutationFn: async ({ voterId, password }: { voterId: string; password: string }) => {
      await voterLoginApi(voterId, password)
      const voterData = await fetchVoter()
      return voterData
    },
    onSuccess: (voterData) => {
      _setVoter(voterData?.id || null)
    },
  })

  // 登入方法
  const login = React.useCallback(
    async (voterId: string, password: string) => {
      await loginMutation.mutateAsync({ voterId, password })
    },
    [loginMutation]
  )

  // 登出方法
  const logout = React.useCallback(async () => {
    await voterLogoutApi()
    _setVoter(null)
  }, [])

  // 提供 context
  return (
    <VoterAuthContext.Provider value={{ isAuthenticated, voter: _voter, login, logout, isVoted: _isVoted, loading: _loading }}>
      {children}
    </VoterAuthContext.Provider>
  )
}

// useVoterAuth hook
export function useVoterAuth() {
  const context = React.useContext(VoterAuthContext)
  if (!context) {
    throw new Error('useVoterAuth must be used within a VoterAuthProvider')
  }
  return context
}