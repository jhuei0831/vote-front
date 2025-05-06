import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import the generated route tree
import { routeTree } from '@/routeTree.gen'
import { UserAuthProvider, useUserAuth } from '@/utils/userAuth'
import { VoterAuthProvider, useVoterAuth } from '@/utils/voterAuth'
import '@/index.css'
import Loading from './components/Loading'

const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({ 
  routeTree,
  context: {
    queryClient,
    auth: undefined!, // This will be set after we wrap the app in an AuthProvider
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// 根據條件選擇 AuthProvider 和 useAuth hook
function getAuthComponents(type: 'user' | 'voter') {
  if (type === 'voter') {
    return {
      Provider: VoterAuthProvider,
      useAuth: useVoterAuth,
    }
  }
  return {
    Provider: UserAuthProvider,
    useAuth: useUserAuth,
  }
}

// 你可以根據路由、環境變數或 props 來決定 authType
const authType: 'user' | 'voter' = window.location.pathname.startsWith('/voter')
  ? 'voter'
  : 'user'

const { Provider: AuthProvider, useAuth } = getAuthComponents(authType)

function InnerApp() {
  const auth = useAuth()
  // 如果還沒取得 user，顯示 loading
  if (auth.loading) {
    return <Loading />
  }
  // 將 auth 傳給 RouterProvider context
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
  // 用選擇的 AuthProvider 包住 InnerApp
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </StrictMode>,
  )
}