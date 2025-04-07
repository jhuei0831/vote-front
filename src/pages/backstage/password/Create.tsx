import React from "react";
import Layout from "@/components/backstage/BackLayout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { FormSchema } from "./Form";
import PasswordForm from "./Form";
import { format } from "path";

export default function PasswordCreate() {
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
        vote_id: new URLSearchParams(window.location.search).get("voteId"),
        number: data.number,
        length: data.length,
        format: data.format,
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