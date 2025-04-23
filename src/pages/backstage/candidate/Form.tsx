import { UseFormReturn } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { fetchQuestions } from "@/pages/backstage/question/Index";
import React from "react";

export const FormSchema = z
  .object({
    question_id: z.string(),
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
  })

type FormProps = {
  voteId: string;
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
};

export default function CandidateForm({ voteId, form, onSubmit }: FormProps) {

  const [questions, setQuestions] = React.useState<{ id: string; title: string }[]>([]);

  React.useEffect(() => {
    fetchQuestions(voteId, 1, 100).then((res) => {
      const formattedQuestions = res.data.map((question: any) => ({
        id: question.id,
        title: question.title,
      }));
      setQuestions(formattedQuestions);
    });
  }, []);
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="question_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <Select onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                  <SelectValue placeholder="Select a question" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {questions.map((question: any) => (
                    <SelectItem key={question.id} value={question.id.toString()}>{question.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My New Candidate" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}