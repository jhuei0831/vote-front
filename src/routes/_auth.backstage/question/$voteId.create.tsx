import QuestionCreate from '@/pages/backstage/question/Create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/backstage/question/$voteId/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <QuestionCreate voteId={voteId} />
}
