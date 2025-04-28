import QuestionIndex from '@/pages/backstage/question/Index'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/backstage/question/$voteId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { voteId } = Route.useParams()
  return <QuestionIndex voteId={voteId} />
}