import React from "react";
import Layout from "@/components/backstage/BackLayout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import QuestionForm, { FormSchema } from "./Form";

export default function QuestionCreate() {
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    api
      .post("/v1/question/create", {
        question_id: data,
        title: data.name,
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
      <QuestionForm form={form} onSubmit={onSubmit} />
    </Layout>
  );
}