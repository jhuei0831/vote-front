import React from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useUpdatePasswordStatus } from "@/utils/password";
import { useQueryClient } from "@tanstack/react-query";

type PasswordStatusProps = {
  voteId: string;
  selections: string[];
  pageIndex: number;
  pageSize: number;
};

export const FormSchema = z
  .object({
    status: z.boolean(),
  })

type FormProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
};

export function PasswordStatusForm({ form, onSubmit }: FormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="password-status-form">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select
                  className="border-1 border-gray-300 rounded-md p-2"
                  value={field.value ? "true" : "false"}
                  onChange={e => field.onChange(e.target.value === "true")}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}

export function PasswordStatus({ voteId, selections, pageIndex, pageSize }: PasswordStatusProps) {
  const queryClient = useQueryClient();
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");
  const updateStatusMutation = useUpdatePasswordStatus();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: true,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    if (selections.length === 0) {
      setIsAlert(true);
      setVariant("destructive");
      setAlertDescription("Please select at least one password.");
      return;
    }
    updateStatusMutation.mutate(
      {
        VoteId: voteId,
        Passwords: selections,
        Status: data.status,
      },
      {
        onSuccess: (res: any) => {
          setIsAlert(true);
          setVariant("success");
          setAlertDescription(res.msg);
          // 重新取得密碼列表資料
          queryClient.invalidateQueries({
            queryKey: ["passwords", voteId, pageIndex + 1, pageSize],
          });
        },
        onError: (err: any) => {
          setIsAlert(true);
          setVariant("destructive");
          setAlertDescription(err?.response?.data?.msg || "Update password status failed");
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
      <PasswordStatusForm form={form} onSubmit={onSubmit} />
    </>
  );
}

export default function PasswordChangeStatusDialog({
  voteId,
  selections,
  pageIndex,
  pageSize,
}: PasswordStatusProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Change Status</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Password Status</DialogTitle>
          <DialogDescription>
            Are you sure you want to change the status of the selected passwords?
          </DialogDescription>
        </DialogHeader>
        <PasswordStatus
          voteId={voteId}
          selections={selections}
          pageIndex={pageIndex}
          pageSize={pageSize}
        />
        <DialogFooter>
          <Button type="submit" form="password-status-form">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
