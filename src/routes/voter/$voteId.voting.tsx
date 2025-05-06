import Voting from '@/pages/frontage/vote/Voting'
import { useVoterAuth } from '@/utils/voterAuth';
import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/voter/$voteId/voting')({
  beforeLoad: ({ context, params }) => {
    console.log(context.auth);
    const { voteId } = params
    if (context.auth.isVoted) {
      // If the user has already voted, redirect to the result page
      throw redirect({
        to: '/voter/' + voteId + '/result',
      })
    }
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
  // Initialize hooks at the top level of the component
  const auth = useVoterAuth();
  const router = useRouter();
  const navigate = useNavigate();
  const { voteId } = Route.useParams()
  
  // Handle logout function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      auth.logout().then(() => {
        router.invalidate().finally(() => {
          navigate({ to: '/voter/' + voteId + '/login' })
        })
      })
    }
  }

  return (
    <>
      <button
        type="button"
        className="text-sm/6 font-semibold text-gray-900 ml-2"
        onClick={handleLogout}
      >
        登出
      </button>
      <Voting />
    </>
  )
}
