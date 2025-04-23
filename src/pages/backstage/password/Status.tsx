import React from "react";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type PasswordStatusProps = {
  voteId: string;
  selections: {};
  onSuccess?: () => void;
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

export default function PasswordStatus({ voteId, onSuccess, selections }: PasswordStatusProps) {
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      status: true,
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    api
      .put("/v1/password/update-status", {
        VoteId: voteId,
        Passwords: selections,
        Status: data.status,
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
      <PasswordStatusForm form={form} onSubmit={onSubmit} />
    </>
  );
}