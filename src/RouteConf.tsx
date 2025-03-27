import { useRoutes } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'

// 這就是比較推薦的做法，將所有的routes拆出來做統一的管理
// 包含了每一層的從屬關係，都可以透過下列的表很清處的看到
// 這裡我們可以嘗試使用react-router-dom 的 <Outlet>，來處理我們常駐在畫面的navbar
// 我這裡將這些東西拆出來用Layout的component去做封裝，類似像mantine的app shell在處理
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "login", element: <Login /> },
    ]
  },
]

const RouteConf = () => {
  const routeConfig = useRoutes(routes)
  return routeConfig
}

export default RouteConf