import { useState, useEffect } from "react";
import Layout from "@/components/backstage/Layout";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import api from "@/utils/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import VoteForm, { FormSchema } from "./Form";
import { useVoteById } from "@/utils/vote";

/**
 * Vote Update Component
 * Handles updating existing vote information
 */
export default function VoteUpdate({ voteId }: { voteId: string }) {
  // Alert state management
  const [_isAlert, setIsAlert] = useState(false);
  const [_variant, setVariant] = useState<
    "default" | "destructive" | "info" | "success" | "warning"
  >("default");
  const [_alertDescription, setAlertDescription] = useState("");

  // Fetch vote data by ID
  const vote = useVoteById(voteId);

  // Initialize form with validation schema
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
      description: "",
      start_time: new Date(),
      end_time: new Date(),
    },
  });

  // Effect to populate form with vote data when available
  useEffect(() => {
    // Update form values when vote data is loaded
    if (vote.data && !vote.isLoading) {
      const { title, description, start_time, end_time } = vote.data;
      form.reset({
        title,
        description,
        start_time: new Date(start_time),
        end_time: new Date(end_time),
      });
    }
    
    // Show error alert if vote data fetch fails
    if (vote.isError) {
      setIsAlert(true);
      setVariant("destructive");
      setAlertDescription("Failed to load vote data.");
    }
  }, [vote.data, vote.isLoading, vote.isError, form]);

  /**
   * Handle form submission
   * @param data Form data
   */
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
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
        setAlertDescription(err.response?.data?.msg || "Update failed");
      });
  };

  // Render component
  return (
    <Layout>
      <h1 className="text-2xl font-semibold tracking-tight text-balance text-gray-900 sm:text-3xl">
        投票編輯
      </h1>
      <hr />
      <Alert 
        variant={_variant} 
        className={_isAlert ? "" : "hidden"} 
        onClose={() => setIsAlert(false)}
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Message</AlertTitle>
        <AlertDescription>{_alertDescription}</AlertDescription>
      </Alert>
      <VoteForm form={form} onSubmit={onSubmit} />
    </Layout>
  );
}