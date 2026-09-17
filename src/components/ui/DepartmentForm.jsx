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
} from "./dialog.jsx";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form.jsx";
import { Input } from "./input";
import { Button } from "./button";

// Coordinates must look like a real "lat,long" pair — this is now a
// REQUIRED field (previously optional), so an empty value fails too.
const COORDINATES_REGEX = /^-?\d{1,3}(\.\d+)?,\s*-?\d{1,3}(\.\d+)?$/;

const departmentSchema = z.object({
  name: z
    .string()
    .min(1, "Department name is required")
    .max(100, "Must be under 100 characters"),
  coordinates: z
    .string()
    .min(1, "Latitude-longitude is required")
    .refine(
      (val) => COORDINATES_REGEX.test(val.trim()),
      "Use the format: latitude,longitude (e.g. 12.9716,77.5946)",
    ),
});

const DepartmentForm = ({ open, onOpenChange, department, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedDepartment = department
    ? {
        name: department.department_name || "",
        coordinates: department.department_lat_long || "",
      }
    : null;

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    // Validate as the user types/leaves a field, not only on submit —
    // this is what lets the Save/Create button reflect validity live,
    // and keeps it disabled until every field is filled correctly.
    mode: "onChange",
    defaultValues: normalizedDepartment || {
      name: "",
      coordinates: "",
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.department_name || "",
        coordinates: department.department_lat_long || "",
      });
    } else {
      form.reset({
        name: "",
        coordinates: "",
      });
    }
  }, [department, form]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      onSubmit(values);
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{department ? "Edit" : "Add"} Department</DialogTitle>
          <DialogDescription>
            {department ? "Update" : "Create a new"} department for your
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
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter department name"
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
              name="coordinates"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel>Department Latitude-Longitude</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 12.9716,77.5946"
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
                {isSubmitting ? "Saving..." : department ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentForm;
