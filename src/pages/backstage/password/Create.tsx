import React from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { AlertCircle, Plus } from "lucide-react";
import { PasswordForm, FormSchema } from "@/pages/backstage/password/Form";
import { useCreatePassword } from "@/utils/password";
import { useQueryClient } from "@tanstack/react-query";

interface PasswordCreateProps {
  voteId: string;
  pageIndex: number;
  pageSize: number;
}

export function PasswordCreateDialog({ voteId, pageIndex, pageSize }: PasswordCreateProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus />
          New Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Password</DialogTitle>
          <DialogDescription>
            Create new password for this vote.
          </DialogDescription>
        </DialogHeader>
        <PasswordCreate voteId={voteId} pageIndex={pageIndex} pageSize={pageSize}  />
        <DialogFooter>
          <Button type="submit" form="password-create-form">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PasswordCreate({ voteId, pageIndex, pageSize }: PasswordCreateProps) {
  // React Query 的 queryClient，用於手動觸發快取更新
  const queryClient = useQueryClient();
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  // 建立密碼的 mutation hook
  const createPasswordMutation = useCreatePassword();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: 1,
      length: 6,
      format: "int",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    createPasswordMutation.mutate(
      {
        voteId: voteId,
        number: data.number,
        length: data.length,
        format: data.format,
      }, 
      {
        onSuccess: (res: any) => {
          setIsAlert(true);
          setVariant("success");
          setAlertDescription(res.msg);
          form.reset();
          // 重新取得密碼列表資料
          queryClient.invalidateQueries({
            queryKey: ["passwords", voteId, pageIndex + 1, pageSize],
          });
        },
        onError: (err: any) => {
          setIsAlert(true);
          setVariant("destructive");
          setAlertDescription(err?.response?.data?.msg || "Create password failed");
        },
      }
    )
  }

  return (
    <>
      <Alert variant={variant} className={isAlert ? "" : "hidden"} onClose={() => setIsAlert(false)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Message</AlertTitle>
        <AlertDescription>{alertDescription}</AlertDescription>
      </Alert>
      <PasswordForm form={form} onSubmit={onSubmit} />
    </>
  );
}