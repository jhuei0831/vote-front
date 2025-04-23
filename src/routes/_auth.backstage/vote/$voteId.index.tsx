import { createFileRoute } from '@tanstack/react-router'
import Index from '@/pages/backstage/vote/Index'

export const Route = createFileRoute('/_auth/backstage/vote/$voteId/')({
  component: Index,
})
