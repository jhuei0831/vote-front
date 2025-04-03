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
import { Input } from "@/components/ui/input";

export const FormSchema = z
  .object({
    question_id: z.bigint(),
    name: z.string().min(2, {
      message: "Name must be at least 2 characters.",
    }),
  })

type FormProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
};

export default function CandidateForm({ form, onSubmit }: FormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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