import NotFound from '@/pages/NotFonud'
import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthContext } from '@/utils/userAuth'

interface RouterContext {
  // The ReturnType of your useAuth hook or the value of your AuthContext
  queryClient: QueryClient,
  auth: AuthContext
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      <TanStackRouterDevtools />
      <ReactQueryDevtools />
    </>
  )
}