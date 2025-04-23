import { createFileRoute } from '@tanstack/react-router'
import Home from '@/pages/frontage/Home'

export const Route = createFileRoute('/')({
  component: Home,
})
