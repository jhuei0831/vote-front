// src/components/UserAction.tsx
import { AuthContext } from '@/utils/userAuth';
import { Link, useRouter, useNavigate } from '@tanstack/react-router';

export function UserAction({auth}: {auth: AuthContext}) {
  // Initialize router and navigate functions
  const router = useRouter();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: '/' })
        })
      })
    }
  }

  return (
    <div>
      {auth ? 
        <>
        <Link to="/backstage" className='text-sm/6 font-semibold text-gray-900'>後台</Link>
          {/* // Logout */}
          <button
            type="button"
            className="text-sm/6 font-semibold text-gray-900 ml-2"
            onClick={handleLogout}
          >
            登出
          </button>
        </>
        : 
        '未登入'
      }
    </div>
  );
}