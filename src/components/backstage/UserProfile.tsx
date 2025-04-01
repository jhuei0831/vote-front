// src/components/UserProfile.tsx
import { useAuth } from '@/context/AuthContext';
import { Link } from 'react-router';

export function UserProfile() {
  const { isAuthorized } = useAuth();

  return (
    <div>
      {isAuthorized ? <Link to="/backstage/" className='text-sm/6 font-semibold text-gray-900'>後台</Link> : '未登入'}
    </div>
  );
}