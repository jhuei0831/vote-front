import React from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
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

interface PasswordCreateProps {
  voteId: string;
  onSuccess?: () => void;
}

export function PasswordCreateDialog({ voteId, onSuccess }: { voteId: string; onSuccess: () => void }) {
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
        <PasswordCreate voteId={voteId} onSuccess={onSuccess} />
        <DialogFooter>
          <Button type="submit" form="password-create-form">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function PasswordCreate({ voteId, onSuccess }: PasswordCreateProps) {
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      number: 1,
      length: 6,
      format: "int",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    api
      .post("/v1/password/create", {
        vote_id: voteId,
        number: data.number,
        length: data.length,
        format: data.format,
      })
      .then((res) => {
        setIsAlert(true);
        setVariant("success");
        setAlertDescription(res.data.msg);
        
        // 呼叫 onSuccess 來刷新父組件中的數據
        if (onSuccess) onSuccess();
      })
      .catch((err) => {
        setIsAlert(true);
        setVariant("destructive");
        setAlertDescription(err.response.data.msg);
      });
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