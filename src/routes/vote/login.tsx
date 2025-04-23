import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/vote/login')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/vote/login"!</div>
}
