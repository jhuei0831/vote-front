import QuestionCreate from '@/pages/backstage/question/Create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/backstage/question/$voteId/create',
)({
  component: QuestionCreate,
})
