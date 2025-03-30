import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // 允許攜帶 HttpOnly Cookie
});

// 攔截器：統一處理 401 未授權
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
    }
    return Promise.reject(error);
  }
);

export default api;