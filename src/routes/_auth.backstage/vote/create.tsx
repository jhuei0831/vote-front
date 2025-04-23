import VoteCreate from '@/pages/backstage/vote/Create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/backstage/vote/create')({
  component: VoteCreate,
})
