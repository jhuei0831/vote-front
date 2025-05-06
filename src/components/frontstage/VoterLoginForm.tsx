import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import api from "@/utils/api"
import { useVoteById } from "@/utils/vote"
import { Eye, EyeOff } from "lucide-react"

interface VoterLoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  voteId: string;
}

export default function VoterLoginForm({className, voteId, ...props}: VoterLoginFormProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const {data: vote} = useVoteById(voteId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null) // 清除之前的錯誤訊息

    try {
      const response = await api.post("/v1/voter/login", {
        vote_id: vote.id,
        password: password,
      })
      console.log("Login successful:", response.data)
      // 紀錄vote_id
      localStorage.setItem("vote_id", vote.id)
      // 在這裡處理登入成功的邏輯，例如儲存 token 或跳轉頁面
      window.location.href = "/voter/"+ vote.id +"/voting"
    } catch (err: any) {
      console.error("Login failed:", err)
      setError(err.response?.data?.message || "Login failed. Please try again.")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{vote?.title}</CardTitle>
          <CardDescription>{vote?.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={password.length > 0 && showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {(
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex={-1}
                    >
                      { showPassword ? <Eye /> : <EyeOff /> }
                    </Button>
                  )}
                </div>
                </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}