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
import { Textarea } from "./textarea";

const departmentSchema = z.object({
  name: z.string().min(1, "Department name is required"),
  coordinates: z.string().optional(),
  address: z.string().optional(),
  lead: z.string().optional(),
});

const DepartmentForm = ({ open, onOpenChange, department, onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const normalizedDepartment = department
    ? {
        name: department.department_name || "",
        coordinates: department.department_lat_long || "",
        address: department.department_address || "",
        lead: department.department_lead || "",
      }
    : null;

  const form = useForm({
    resolver: zodResolver(departmentSchema),
    defaultValues: normalizedDepartment || {
      name: "",
      coordinates: "",
      address: "",
      lead: "",
    },
  });

  useEffect(() => {
    if (department) {
      form.reset({
        name: department.department_name || "",
        coordinates: department.department_lat_long || "",
        address: department.department_address || "",
        lead: department.department_lead || "",
      });
    } else {
      form.reset({
        name: "",
        coordinates: "",
        address: "",
        lead: "",
      });
    }
  }, [department, form]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting Values", values);
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
      <DialogContent className="sm:max-w-[500px]">
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
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter department name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coordinates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Latitude-Longitude</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 12.9716,77.5946" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Address</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter physical address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Lead (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter lead name" {...field} />
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
                disabled={isSubmitting}
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
