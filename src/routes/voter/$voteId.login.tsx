import Login from '@/pages/frontage/vote/Login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/voter/$voteId/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <Login voteId={voteId} />
}
