import CandidateIndex from '@/pages/backstage/candidate/Index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/backstage/candidate/$voteId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <CandidateIndex voteId={voteId} />
}
