import api from './axios'

// 用戶登入
export const login = (credentials) => {
  return api.post('/user/login', credentials)
}

// 檢查token有效性
export const checkAuth = () => {
  return api.post('/user/check-auth')
}

// 用戶登出
export const logout = () => {
  return api.post('/user/logout')
}

// 獲取當前用戶信息
export const getCurrentUser = () => {
  return api.get('/user/me')
}
