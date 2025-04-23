import PasswordIndex from '@/pages/backstage/password/Index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/backstage/password/$voteId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams();
  return <PasswordIndex voteId={voteId} />
}
