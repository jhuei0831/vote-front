import VoteUpdate from '@/pages/backstage/vote/Update'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/backstage/vote/$voteId/update')({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <VoteUpdate voteId={voteId} />
}