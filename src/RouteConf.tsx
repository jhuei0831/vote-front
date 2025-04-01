import { useRoutes } from "react-router"
import Login from '@/pages/Login'
import { Home as FrontHome } from '@/pages/frontage/Home'
import { Home as BackHome } from '@/pages/backstage/Home'
import Index from '@/pages/backstage/vote/Index'
import Create from '@/pages/backstage/vote/create'
import Update from '@/pages/backstage/vote/Update'
import { ProtectedRoute } from "@/router/ProtectedRoute"
import { AuthProvider } from "@/context/AuthContext"

// 這就是比較推薦的做法，將所有的routes拆出來做統一的管理
// 包含了每一層的從屬關係，都可以透過下列的表很清處的看到
// 這裡我們可以嘗試使用react-router-dom 的 <Outlet>，來處理我們常駐在畫面的navbar
// 我這裡將這些東西拆出來用Layout的component去做封裝，類似像mantine的app shell在處理

const routes = [
  { 
    children: [
      { path: "/login", element: <Login /> },
    ]
  },
  {
    element: <AuthProvider><ProtectedRoute /></AuthProvider>,
    children: [
      { path: "/", element: <FrontHome /> },
    ]
  },
  {
    path: "/backstage",
    element: <AuthProvider><ProtectedRoute /></AuthProvider>,
    children: [
      { index: true, element: <BackHome /> },
      { path: "/backstage/vote", element: <Index /> },
      { path: "/backstage/vote/create", element: <Create /> },
      { path: "/backstage/vote/update", element: <Update /> },
    ]
  }
]

const RouteConf = () => {
  const routeConfig = useRoutes(routes)
  return routeConfig
}

export default RouteConf