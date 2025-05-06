import { redirect, createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/voter/$voteId/result')({
  beforeLoad: ({ context, params }) => {
      console.log(context.auth);
      const { voteId } = params
      // Check if context.auth exists and if the user is authenticated
      if (!context.auth || !context.auth.isAuthenticated) {
        // Get voteId from params directly
        throw redirect({
          to:  voteId ? '/voter/' + voteId + '/login' : '/',
        })
      }
    },
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello, You have voted!</div>
}
