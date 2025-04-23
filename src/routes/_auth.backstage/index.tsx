import { createFileRoute } from '@tanstack/react-router'
import Home from '@/pages/backstage/Home'

export const Route = createFileRoute('/_auth/backstage/')({
  component: Home,
})

