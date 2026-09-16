import { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Button } from "./button";
import { Switch } from "./switch";

const designationSchema = z.object({
  name: z
    .string()
    .min(1, "Designation name is required")
    .max(100, "Must be under 100 characters"),
  admin_access: z.boolean().default(false),
});

export function DesignationForm({ open, onOpenChange, designation, onSubmit }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(designationSchema),
    // Validate live so the Save button's disabled state always matches
    // what's actually in the fields, instead of only checking on submit.
    mode: "onChange",
    defaultValues: {
      name: designation?.designation_name || "",
      admin_access: designation?.admin_access || false,
    },
  });

  useEffect(() => {
    if (designation) {
      form.reset({
        name: designation.designation_name,
        admin_access: designation.admin_access,
      });
    } else {
      form.reset({
        name: "",
        admin_access: false,
      });
    }
  }, [designation, form]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      await onSubmit({ ...values, id: designation?.id });
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{designation ? "Edit" : "Add"} Designation</DialogTitle>
          <DialogDescription>
            {designation ? "Update" : "Create a new"} designation for your
            organization.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Designation Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter designation title"
                      {...field}
                      className={
                        fieldState.error
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="admin_access"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Admin Access</FormLabel>
                    <FormDescription>
                      Grant admin privileges to this designation
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
                className="bg-instattend-600 hover:bg-instattend-700 text-white shadow rounded px-3 py-2 text-sm sm:px-4 sm:py-2"
              >
                {isSubmitting ? "Saving..." : designation ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
