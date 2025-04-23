import { redirect, createFileRoute } from '@tanstack/react-router'
import Login from '@/pages/Login'
import { z } from 'zod'

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
const fallback = '/' as const

export const Route = createFileRoute('/(auth)/login')({
  validateSearch: z.object({
    redirect: z.string().optional().catch(''),
  }),
  beforeLoad: ({ context, search }) => {
    // Check if context.auth exists and is authenticated
    if (context.auth && context.auth.isAuthenticated) {
      throw redirect({ to: search.redirect || fallback })
    }
  },
  component: Login,
})
