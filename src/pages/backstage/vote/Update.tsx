import React from "react";
import Layout from "@/components/backstage/BackLayout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import VoteForm, { FormSchema } from "./Form";
import { useParams } from "@tanstack/react-router";

export default function VoteUpdate() {
  const { voteId } = useParams({strict: false});
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

  React.useEffect(() => {
    async function fetchData() {
      try {
        const response = await api.get(`/v1/vote/${voteId}`);
        const { title, description, start_time, end_time } = response.data.data;
        form.reset({
          title,
          description,
          start_time: new Date(start_time),
          end_time: new Date(end_time),
        });
      } catch (err) {
        setIsAlert(true);
        setVariant("destructive");
        setAlertDescription("Failed to load vote data.");
      }
    }

    if (voteId) {
      fetchData();
    }
  }, [voteId, form]);

  function onSubmit(data: z.infer<typeof FormSchema>) {
    api
      .put(`/v1/vote/${voteId}`, {
        title: data.title,
        description: data.description,
        startTime: data.start_time,
        endTime: data.end_time,
      })
      .then((res) => {
        setIsAlert(true);
        setVariant("success");
        setAlertDescription(res.data.msg);
      })
      .catch((err) => {
        setIsAlert(true);
        setVariant("destructive");
        setAlertDescription(err.response.data.msg);
      });
  }

  return (
    <Layout>
      <h1 className="text-2xl font-semibold tracking-tight text-balance text-gray-900 sm:text-3xl">
        投票編輯
      </h1>
      <hr />
      <Alert variant={variant} className={isAlert ? "" : "hidden"} onClose={() => setIsAlert(false)}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Message</AlertTitle>
        <AlertDescription>{alertDescription}</AlertDescription>
      </Alert>
      <VoteForm form={form} onSubmit={onSubmit} />
    </Layout>
  );
}