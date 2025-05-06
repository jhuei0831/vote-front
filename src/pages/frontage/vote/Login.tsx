import VoterLoginForm from "@/components/frontstage/VoterLoginForm";

export default function Login({ voteId }: { voteId: string }) {
  
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <VoterLoginForm voteId={voteId}  />
      </div>
    </div>
  )
}