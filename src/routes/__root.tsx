import NotFound from '@/pages/NotFonud'
import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { UserAuthContext } from '@/utils/userAuth'
import { VoterAuthContext } from '@/utils/voterAuth'

interface RouterContext {
  // The ReturnType of your useUserAuth hook or the value of your AuthContext
  queryClient: QueryClient,
  auth: UserAuthContext | VoterAuthContext
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