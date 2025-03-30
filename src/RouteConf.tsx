import { useEffect, useState } from "react"
import { useRoutes, Outlet, useNavigate  } from "react-router"
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import api from './utils/api';
import { ProtectedRoute } from "./router/ProtectedRoute"
import { AuthProvider } from "./context/AuthContext"

// 這就是比較推薦的做法，將所有的routes拆出來做統一的管理
// 包含了每一層的從屬關係，都可以透過下列的表很清處的看到
// 這裡我們可以嘗試使用react-router-dom 的 <Outlet>，來處理我們常駐在畫面的navbar
// 我這裡將這些東西拆出來用Layout的component去做封裝，類似像mantine的app shell在處理

export function RedirectIfLoggedIn() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.post('/v1/user/check-auth')
      .then(() => {
        setIsAuthorized(true);
        navigate('/'); // 如果已經登入，導向首頁
      })
      .catch(() => setIsAuthorized(false));
  }, []);

  if (isAuthorized === null) return <div>Loading2...</div>;
  return <Outlet />; // 渲染子路由
}

const routes = [
  { 
    children: [
      { path: "/login", element: <Login /> },
    ]
  },
  {
    element: <AuthProvider><ProtectedRoute /></AuthProvider>,
    children: [
      { path: "/", element: <Home /> },
    ]
  },
]

const RouteConf = () => {
  const routeConfig = useRoutes(routes)
  return routeConfig
}

export default RouteConf