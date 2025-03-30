// src/hooks/useAuthCheck.ts
import { useEffect } from 'react';
import api from '../utils/api';

export const useAuthCheck = (required = true) => {
  useEffect(() => {
    if (!required) return;

    const checkAuth = async () => {
      try {
        await api.post('/v1/user/check-auth');
      } catch (error) {
        // 攔截器已處理 401，這裡可添加額外邏輯
      }
    };

    checkAuth();
  }, [required]);
};