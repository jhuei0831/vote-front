import React from "react";
import Layout from "@/components/backstage/BackLayout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import VoteForm, { FormSchema } from "@/pages/backstage/vote/Form";

export default function VoteCreate() {
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: new Date(),
      end_time: new Date(),
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    api
      .post("/v1/vote/create", {
        title: data.title,
        description: data.description,
        startTime: data.start_time,
        endTime: data.end_time,
      })
      .then((res) => {
        setIsAlert(true);
        setVariant("success");
        setAlertDescription(res.data.msg);
        form.reset();
      })
      .catch((err) => {
        setIsAlert(true);
        setVariant("destructive");
        setAlertDescription(err.response.data.msg);
      });
  }

  return (
    <Layout>
      <Alert variant={variant} className={isAlert ? "" : "hidden"} onClose={() => setIsAlert(false)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Message</AlertTitle>
        <AlertDescription>{alertDescription}</AlertDescription>
      </Alert>
      <VoteForm form={form} onSubmit={onSubmit} />
    </Layout>
  );
}