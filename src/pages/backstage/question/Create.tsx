import React from "react";
import Layout from "@/components/backstage/Layout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import QuestionForm, { FormSchema } from "@/pages/backstage/question/Form";
import { useCreateQuestion } from "@/utils/question"; // 載入自定義 hook
import AlertMessage from "@/components/AlertMessage";
import { useQueryClient } from "@tanstack/react-query";

export default function QuestionCreate({voteId}: { voteId: string }) {
  const queryClient = useQueryClient();
  // 警示訊息狀態
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  // 表單 hook
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // 使用自定義 hook 來建立問題
  const createQuestionMutation = useCreateQuestion();

  /**
   * 表單送出處理函式
   * @param data 表單資料
   */
  function onSubmit(data: z.infer<typeof FormSchema>) {
    // 呼叫 useCreateQuestion 的 mutate 方法
    createQuestionMutation.mutate(
      {
        vote_id: voteId,
        title: data.title,
        description: data.description,
      },
      {
        onSuccess: (res: any) => {
          setIsAlert(true);
          setVariant("success");
          setAlertDescription(res.msg);
          queryClient.invalidateQueries({ queryKey: ['questions'] });
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
      {/* 問題表單元件 */}
      <QuestionForm form={form} onSubmit={onSubmit} voteId={voteId} />
    </Layout>
  );
}