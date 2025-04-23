import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// Import the generated route tree
import { routeTree } from '@/routeTree.gen'
import { AuthProvider, useAuth } from '@/utils/userAuth'
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

function InnerApp() {
  const auth = useAuth()
  // 如果還沒取得 user，顯示 loading
  if (auth.loading) {
    return <Loading />
  }
  return <RouterProvider router={router} context={{ auth }} />
}

function App() {
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