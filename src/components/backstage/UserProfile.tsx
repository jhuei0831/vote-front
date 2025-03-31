// src/components/UserProfile.tsx
import { useAuth } from '@/context/AuthContext';

export function UserProfile() {
  const { isAuthorized } = useAuth();

  return (
    <div>
      {isAuthorized ? '已登入' : '未登入'}
    </div>
  );
}