import api from '@/api/axios'

export interface LoginCredentials {
  username: string;
  password: string;
}

interface User {
  id: number;
  account: string;
  password: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface ResponseData {
  status: number;
  msg: string;
  data: User | null;
}

// 用戶登入
export const login = (credentials: LoginCredentials): Promise<ResponseData> => {
  return api.post('/user/login', credentials)
}

// 檢查token有效性
export const checkAuth = (): Promise<ResponseData> => {
  return api.post('/user/check-auth')
}
  
// 用戶登出
export const logout = (): Promise<ResponseData> => {
  return api.post('/user/logout')
}

// 獲取當前用戶信息
export const getCurrentUser = (): Promise<ResponseData> => {
  return api.get('/user/me')
}
