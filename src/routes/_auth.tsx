import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

// src/routes/_authenticated.tsx
export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    console.log(context.auth);
    // Check if context.auth exists and if the user is authenticated
    if (!context.auth || !context.auth.isAuthenticated) {
      throw redirect({
        to: '/login',
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <>
      <Outlet />
    </>
  )
}
