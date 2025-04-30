import React from "react";
import Layout from "@/components/backstage/Layout";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import VoteForm, { FormSchema } from "@/pages/backstage/vote/Form";
import { useCreateVote } from "@/utils/vote";
import AlertMessage from "@/components/AlertMessage";

export default function VoteCreate() {
  // 狀態管理
  const [isAlert, setIsAlert] = React.useState(false);
  const [variant, setVariant] = React.useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [alertDescription, setAlertDescription] = React.useState("");

  // 表單 hook 初始化
  const _today = new Date();
  const _tomorrow = new Date(_today);
  _tomorrow.setDate(_tomorrow.getDate() + 1);
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: _today,
      end_time: _tomorrow,
    },
  });

  // 使用自定義 hook 來建立投票
  const createVoteMutation = useCreateVote();

  /**
   * 表單送出處理函式
   * @param data 表單資料
   */
  function onSubmit(data: z.infer<typeof FormSchema>) {
    // 呼叫 useCreateVote 的 mutate 方法
    createVoteMutation.mutate(
      {
        title: data.title,
        description: data.description,
        startTime: data.start_time.toISOString(),
        endTime: data.end_time.toISOString(),
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
      {/* 投票表單元件 */}
      <VoteForm form={form} onSubmit={onSubmit} />
    </Layout>
  );
}