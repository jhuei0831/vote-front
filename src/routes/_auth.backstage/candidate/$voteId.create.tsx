import CandidateCreate from '@/pages/backstage/candidate/Create'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_auth/backstage/candidate/$voteId/create',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <CandidateCreate voteId={voteId} />
}
