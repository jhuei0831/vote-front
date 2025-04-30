import React from "react";
import Layout from "@/components/backstage/Layout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormSchema } from "./Form";
import CandidateForm from "./Form";
import AlertMessage from "@/components/AlertMessage";
import { useCreateCandidate } from "@/utils/candidate";

export default function CandidateCreate({ voteId }: { voteId: string }) {
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

  // 使用自定義 hook 來建立候選名單
  const createCandidateMutation = useCreateCandidate();

  function onSubmit(data: z.infer<typeof FormSchema>) {
    // 呼叫 useCreateCandidate 的 mutate 方法
    createCandidateMutation.mutate(  
      {
        question_id: data.question_id,
        name: data.name,
      },
      {
        onSuccess: (res: any) => {
          setIsAlert(true);
          setVariant("success");
          setAlertDescription(res.msg);
          form.reset();
        },
        onError: (err: any) => {
          setIsAlert(true);
          setVariant("destructive");
          setAlertDescription(err?.response?.data?.msg || "建立失敗");
        },
      }
    );
  }

  return (
    <Layout>
      {/* 警示訊息區塊 */}
      <AlertMessage
        variant={variant}
        isOpen={isAlert}
        description={alertDescription}
        onClose={() => setIsAlert(false)}
      />
      <CandidateForm voteId={voteId} form={form} onSubmit={onSubmit} />
    </Layout>
  );
}