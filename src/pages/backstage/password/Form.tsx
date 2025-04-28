import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
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
import { formatOptions } from "@/utils/password";

export const FormSchema = z
  .object({
    number: z.coerce.number().gte(1, {
      message: "Number must be at least 1.",
    }),
    length: z.coerce.number().gte(6, {
      message: "Length must be at least 6.",
    }),
    format: z.string()
  })

type FormProps = {
  form: UseFormReturn<z.infer<typeof FormSchema>>;
  onSubmit: (data: z.infer<typeof FormSchema>) => void;
};

export function PasswordForm({ form, onSubmit }: FormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" id="password-create-form">
        <FormField
          control={form.control}
          name="number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                This is your public display name.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="length"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Length</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="format"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Format</FormLabel>
              <FormControl>
                <select {...field} className="border-1 border-gray-300 rounded-md p-2">
                  {formatOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}