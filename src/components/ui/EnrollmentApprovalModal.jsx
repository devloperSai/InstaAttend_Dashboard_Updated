import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog.jsx";
import { Button } from "./button.jsx";
import { Input } from "./input.jsx";
import { Label } from "./label.jsx";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./Select.jsx";
import { Loader2 } from "lucide-react";
import { enrollmentService } from "../../api/services/enrollment.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\d{7,15}$/;

/**
 * Popup form shown when an admin clicks "Approve" on a pending enrollment
 * request. Mirrors the "Review employee enrollment" mockup: prefilled
 * name/email/phone (still editable, since approve-request accepts updated
 * values), plus Department/Designation dropdowns populated from the
 * get-request-details response. Submitting calls approve-request; nothing
 * changes on the server until then.
 *
 * @param {boolean} open
 * @param {(open: boolean) => void} onOpenChange
 * @param {string|null} requestId - id of the enrollment request being reviewed
 * @param {(id: string) => void} [onApproved] - called with the request id after a successful approval
 */
const EnrollmentApprovalModal = ({
  open,
  onOpenChange,
  requestId,
  onApproved,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [details, setDetails] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone_number: "",
    department_id: "",
    designation_id: "",
  });
  const [errors, setErrors] = useState({});

  // Fetch request details (employee info + org departments/designations)
  // fresh every time the modal opens for a given request.
  useEffect(() => {
    if (!open || !requestId) return;
    let cancelled = false;

    setIsLoading(true);
    setLoadError(false);
    setDetails(null);
    setErrors({});

    enrollmentService
      .getOne(requestId)
      .then((data) => {
        if (cancelled) return;
        setDetails(data);
        setFormData({
          username: data?.employee?.username || "",
          email: data?.employee?.email || "",
          phone_number: data?.employee?.phone_number || "",
          department_id: "",
          designation_id: "",
        });
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, requestId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Name is required";
    if (!EMAIL_REGEX.test(formData.email))
      newErrors.email = "Enter a valid email address";
    if (!PHONE_REGEX.test(formData.phone_number))
      newErrors.phone_number = "Enter a valid phone number";
    if (!formData.department_id)
      newErrors.department_id = "Department is required";
    if (!formData.designation_id)
      newErrors.designation_id = "Designation is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await enrollmentService.approve(requestId, {
        username: formData.username.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim(),
        department_id: formData.department_id,
        designation_id: formData.designation_id,
      });
      onApproved?.(requestId);
      onOpenChange(false);
    } catch {
      // enrollmentService already surfaced a toast on failure.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Review employee enrollment</DialogTitle>
          <DialogDescription>
            Verify this employee and choose their department and designation. No
            change is made until you submit.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading request details...
          </div>
        ) : loadError ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-600 mb-4">
              Couldn't load this request's details. Please try again.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="enroll-name">Name</Label>
              <Input
                id="enroll-name"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={
                  errors.username
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.username && (
                <p className="text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enroll-email">Email</Label>
              <Input
                id="enroll-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={
                  errors.email
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="enroll-phone">Phone</Label>
              <Input
                id="enroll-phone"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                className={
                  errors.phone_number
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }
              />
              {errors.phone_number && (
                <p className="text-red-500 text-sm">{errors.phone_number}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={formData.department_id}
                onValueChange={(value) =>
                  handleSelectChange("department_id", value)
                }
              >
                <SelectTrigger
                  className={
                    errors.department_id
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  {(details?.departments || []).map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.department_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department_id && (
                <p className="text-red-500 text-sm">{errors.department_id}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Designation</Label>
              <Select
                value={formData.designation_id}
                onValueChange={(value) =>
                  handleSelectChange("designation_id", value)
                }
              >
                <SelectTrigger
                  className={
                    errors.designation_id
                      ? "border-red-500 focus:ring-red-500"
                      : ""
                  }
                >
                  <SelectValue placeholder="Choose a designation" />
                </SelectTrigger>
                <SelectContent>
                  {(details?.designations || []).map((desig) => (
                    <SelectItem key={desig.id} value={desig.id}>
                      {desig.designation_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation_id && (
                <p className="text-red-500 text-sm">{errors.designation_id}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-instattend-600 hover:bg-instattend-700 text-white"
              >
                {isSubmitting ? "Approving..." : "Approve enrollment"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentApprovalModal;
