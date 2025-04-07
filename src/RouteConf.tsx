import { useRoutes } from "react-router"
import Login from '@/pages/Login'
import { Home as FrontHome } from '@/pages/frontage/Home'
import { Home as BackHome } from '@/pages/backstage/Home'
import VoteIndex from '@/pages/backstage/vote/Index'
import VoteCreate from '@/pages/backstage/vote/Create'
import VoteUpdate from '@/pages/backstage/vote/Update'
import QuestionIndex from '@/pages/backstage/question/Index'
import QuestionCreate from '@/pages/backstage/question/Create'
import CandidateIndex from '@/pages/backstage/candidate/Index'
import CandidateCreate from '@/pages/backstage/candidate/Create'
import PasswordIndex from '@/pages/backstage/password/Index'
import { ProtectedRoute, RouteWithVoteId } from "@/router/ProtectedRoute"
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
      { path: "/backstage/vote", element: <VoteIndex /> },
      { path: "/backstage/vote/create", element: <VoteCreate /> },
      {
        path: "/backstage",
        element: <RouteWithVoteId />,
        children: [
          { path: "/backstage/vote/update", element: <VoteUpdate /> },
          { path: "/backstage/question", element: <QuestionIndex /> },
          { path: "/backstage/question/create", element: <QuestionCreate /> },
          { path: "/backstage/candidate", element: <CandidateIndex /> },
          { path: "/backstage/candidate/create", element: <CandidateCreate /> },
          { path: "/backstage/password", element: <PasswordIndex /> },
        ],
      },
    ]
  }
]

const RouteConf = () => {
  const routeConfig = useRoutes(routes)
  return routeConfig
}

export default RouteConf