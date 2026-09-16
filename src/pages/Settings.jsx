// src/pages/Settings.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import MainLayout from "../components/layout/MainLayout.jsx";
import { Button } from "../components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/Tabs.jsx";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import DepartmentForm from "../components/ui/DepartmentForm";
import { DesignationForm } from "../components/ui/DesignationForm.jsx";
import { Pencil, Plus, Trash2, CheckCircle2 } from "lucide-react";
import { settingService } from "../api/services/setting.service.js";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Textarea } from "../components/ui/textarea";
import { departmentService } from "../api/services/department.service.js";
import { designationService } from "../api/services/designation.service.js";
import SettingsSkeleton from "../components/skeleton/SettingsSkeleton.jsx";

// Settings page uses a solid card background (not `.glass-panel`) — the
// frosted/translucent glass effect combined with backdrop-blur made
// labels, table text, and input values look washed out / low-contrast
// on this form-heavy page. Every other page keeps `.glass-panel`
// unchanged; this swap is scoped to Settings only.
const SETTINGS_CARD = "bg-white border border-gray-200 shadow-sm";

// ---------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------
// Kept centralized here (rather than inline per-field) so the same rules
// drive both the red-border/error-message UI and the "is everything
// valid yet" check that gates the Save buttons. Each validator returns
// an empty string when the value is fine, or a short user-facing
// message when it isn't. Every field in both forms is REQUIRED.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?\d{7,15}$/;
const WEBSITE_REGEX =
  /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .\-?=&%#]*)*\/?$/i;
const TAX_ID_REGEX = /^[A-Za-z0-9-]{5,20}$/;
const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const validateCompanyField = (name, value) => {
  const v = (value ?? "").toString().trim();

  switch (name) {
    case "company_name":
      if (!v) return "Company name is required";
      if (v.length > 100) return "Must be under 100 characters";
      return "";

    case "company_address":
      if (!v) return "Address is required";
      if (v.length > 200) return "Must be under 200 characters";
      return "";

    case "company_phone":
      if (!v) return "Phone number is required";
      if (!PHONE_REGEX.test(v))
        return "Enter a valid phone number (7-15 digits)";
      return "";

    case "company_email":
      if (!v) return "Email is required";
      if (!EMAIL_REGEX.test(v)) return "Enter a valid email address";
      return "";

    case "company_website":
      if (!v) return "Website is required";
      if (!WEBSITE_REGEX.test(v)) return "Enter a valid website URL";
      return "";

    case "company_gst_no":
      if (!v) return "Tax ID is required";
      if (!TAX_ID_REGEX.test(v)) return "5-20 letters, numbers or hyphens only";
      return "";

    default:
      return "";
  }
};

const validateGeneralField = (name, value) => {
  const v = (value ?? "").toString().trim();

  switch (name) {
    case "standard_work_hours": {
      if (!v) return "Standard work hours is required";
      const n = Number(v);
      if (!Number.isFinite(n) || !Number.isInteger(n) || n < 1 || n > 24) {
        return "Enter a whole number between 1 and 24";
      }
      return "";
    }

    case "timezone":
      if (!v) return "Timezone is required";
      if (v.length < 2) return "Enter a valid timezone";
      return "";

    case "week_start_day":
      if (!v) return "Week start day is required";
      if (!WEEKDAYS.includes(v.toLowerCase())) {
        return "Enter a valid day name (e.g. Monday)";
      }
      return "";

    case "date_format":
      if (!v) return "Date format is required";
      if (!/^[dmyDMY/\-. ]+$/.test(v)) {
        return "Use date tokens only, e.g. DD/MM/YYYY";
      }
      return "";

    case "leave_year_start":
      if (!v) return "Leave year start is required";
      return "";

    default:
      return "";
  }
};

const COMPANY_FIELDS = [
  "company_name",
  "company_address",
  "company_phone",
  "company_email",
  "company_website",
  "company_gst_no",
];

const GENERAL_FIELDS = [
  "standard_work_hours",
  "timezone",
  "week_start_day",
  "date_format",
  "leave_year_start",
];

const Settings = () => {
  const [company, setCompany] = useState({});
  const [generalSettings, setGeneralSettings] = useState({});
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [addDepartmentOpen, setAddDepartmentOpen] = useState(false);
  const [editDepartmentOpen, setEditDepartmentOpen] = useState(false);
  const [addDesignationOpen, setAddDesignationOpen] = useState(false);
  const [editDesignationOpen, setEditDesignationOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);
  const [selectedDesignation, setSelectedDesignation] = useState(undefined);

  // ---- Field-level validation state ----
  const [companyErrors, setCompanyErrors] = useState({});
  const [generalErrors, setGeneralErrors] = useState({});
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);

  // ---- Submitted/locked state ----
  // When true, the form's fields are read-only and the footer shows a
  // disabled "Submitted" pill + an "Edit" button instead of the Save
  // button. Starts `true` on load if a saved record already exists
  // (fetchSettings sets this once data comes back), and flips to `true`
  // again right after a successful save. The Edit button flips it back
  // to `false` so the same fields (with their current values intact)
  // become editable again.
  const [companyLocked, setCompanyLocked] = useState(false);
  const [generalLocked, setGeneralLocked] = useState(false);

  // Delete-confirmation modal state — shared between the Departments and
  // Designations tabs. `deleteTarget` carries both which kind of record
  // it is ("department" | "designation") and the record itself, so one
  // modal + one confirm handler can serve both tables. This is the piece
  // that was previously missing entirely — the Trash2 buttons had no
  // onClick at all, so clicking delete did nothing and no popup ever
  // appeared. The modal below renders as a fixed, centered overlay (same
  // pattern used for the delete-confirmation modal in Employees.jsx), so
  // it always shows up centered on the same screen the click happened on.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Recomputes every company field's error on demand — used both after
  // fetch (so the Save button starts in the correct state) and after
  // every keystroke.
  const revalidateCompany = useCallback((data) => {
    const nextErrors = {};
    COMPANY_FIELDS.forEach((field) => {
      nextErrors[field] = validateCompanyField(field, data[field]);
    });
    setCompanyErrors(nextErrors);
  }, []);

  const revalidateGeneral = useCallback((data) => {
    const nextErrors = {};
    GENERAL_FIELDS.forEach((field) => {
      nextErrors[field] = validateGeneralField(field, data[field]);
    });
    setGeneralErrors(nextErrors);
  }, []);

  const handleCompanyChange = (e) => {
    if (companyLocked) return; // fields are read-only while locked
    const { name, value } = e.target;
    setCompany((prev) => {
      const next = { ...prev, [name]: value };
      setCompanyErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateCompanyField(name, value),
      }));
      return next;
    });
  };

  const isCompanyValid = useMemo(
    () =>
      COMPANY_FIELDS.every(
        (field) => !validateCompanyField(field, company[field]),
      ),
    [company],
  );

  const isGeneralValid = useMemo(
    () =>
      GENERAL_FIELDS.every(
        (field) => !validateGeneralField(field, generalSettings[field]),
      ),
    [generalSettings],
  );

  const saveCompanyData = async () => {
    // Belt-and-braces: re-validate right before submit so a stale click
    // can never slip an invalid payload through, and re-show every
    // error if something is wrong.
    revalidateCompany(company);
    if (!isCompanyValid) return;

    setIsSavingCompany(true);
    try {
      const companyConfig = {
        company_name: company.company_name,
        company_address: company.company_address,
        company_phone: company.company_phone,
        company_email: company.company_email,
        company_website: company.company_website,
        company_gst_no: company.company_gst_no,
      };

      const payload = {
        type: "company_information",
        config: companyConfig,
      };

      // Connects to the same settingService API used elsewhere: PUT
      // (update) when a record already exists, POST (create) the first
      // time. Either way, on success the form locks into "Submitted".
      if (company.id) {
        await settingService.updateSettings(company.id, payload);
      } else {
        await settingService.createSetting(payload);
      }
      await fetchSettings();
      setCompanyLocked(true);
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleAddDepartment = async (department) => {
    const departmentData = {
      department_name: department.name,
      department_lat_long: department.coordinates,
      department_address: department.address,
      department_lead: department.lead,
    };
    await departmentService.createDepartment(departmentData);
    fetchDepartments();
  };

  const handleUpdateDepartment = async (department) => {
    const updatedDepartment = {
      department_name: department.name,
      department_lat_long: department.coordinates,
      department_address: department.address,
      department_lead: department.lead,
    };
    await departmentService.updateDepartment(department.id, updatedDepartment);
    fetchDepartments();
  };

  const handleAddDesignation = async (designation) => {
    const designationData = {
      designation_name: designation.name,
      admin_access: designation.admin_access,
    };
    await designationService.createDesignation(designationData);
    fetchDesignations();
  };

  const handleUpdateDesignation = async (designation) => {
    const updatedDesignation = {
      designation_name: designation.name,
      admin_access: designation.admin_access,
    };
    await designationService.updateDesignation(
      designation.id,
      updatedDesignation,
    );
    fetchDesignations();
  };

  // ---- Delete flow (Departments + Designations) ----
  // Opens the confirmation modal for a given record. `type` is
  // "department" or "designation" — used both to label the modal text
  // and to pick which service/refetch to call on confirm.
  const openDeleteConfirm = (type, item) => {
    setDeleteTarget({ type, item });
  };

  const closeDeleteConfirm = () => {
    if (isDeleting) return; // don't allow closing mid-request
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    setIsDeleting(true);
    try {
      if (type === "department") {
        await departmentService.deleteDepartment(item.id);
        fetchDepartments();
      } else if (type === "designation") {
        await designationService.deleteDesignation(item.id);
        fetchDesignations();
      }
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Add a handler for general settings input changes
  const handleGeneralSettingsChange = (e) => {
    if (generalLocked) return; // fields are read-only while locked
    const { name, value } = e.target;
    setGeneralSettings((prev) => {
      const next = { ...prev, [name]: value };
      setGeneralErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateGeneralField(name, value),
      }));
      return next;
    });
  };

  // Create a new function to save general settings
  const saveGeneralSettings = async () => {
    revalidateGeneral(generalSettings);
    if (!isGeneralValid) return;

    setIsSavingGeneral(true);
    try {
      const payload = {
        type: "general_settings",
        config: Object.fromEntries(
          GENERAL_FIELDS.map((field) => [field, generalSettings[field]]),
        ),
      };

      if (generalSettings.id) {
        await settingService.updateSettings(generalSettings.id, payload);
      } else {
        await settingService.createSetting(payload);
      }
      await fetchSettings();
      setGeneralLocked(true);
    } finally {
      setIsSavingGeneral(false);
    }
  };

  const fetchSettings = useCallback(async () => {
    const settings = await settingService.getAll();

    // Filter settings by type
    const companySettings = settings
      .filter((item) => item.type === "company_information")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]; // get latest

    const generalSettingsRecord = settings
      .filter((item) => item.type === "general_settings")
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    // Set state
    if (companySettings) {
      const companyData = companySettings.config || {};
      setCompany(companyData);
      revalidateCompany(companyData);
      // A saved record already exists — start in the locked/"Submitted"
      // view rather than forcing the user to re-open an edit they
      // already made in a previous session.
      setCompanyLocked(true);
    } else {
      revalidateCompany({});
      setCompanyLocked(false);
    }

    if (generalSettingsRecord) {
      const generalData = {
        ...(generalSettingsRecord.config || {}),
        id: generalSettingsRecord.id,
      };
      setGeneralSettings(generalData);
      revalidateGeneral(generalData);
      setGeneralLocked(true);
    } else {
      revalidateGeneral({});
      setGeneralLocked(false);
    }
  }, [revalidateCompany, revalidateGeneral]);

  const fetchDepartments = useCallback(async () => {
    const data = await departmentService.getDepartments();
    setDepartments(data);
  }, []);

  const fetchDesignations = useCallback(async () => {
    const data = await designationService.getDesignations();
    setDesignations(data);
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchSettings()
      .then(async () => {
        await fetchDepartments();
        await fetchDesignations();
      })
      .finally(() => setIsLoading(false));
  }, [fetchSettings, fetchDepartments, fetchDesignations]);

  // Small shared helper for rendering the red-border + message pattern
  // consistently across every field below. When `locked` is true it
  // also mutes the field visually to signal it's read-only.
  const fieldClass = (hasError, locked) =>
    [
      hasError ? "border-red-500 focus-visible:ring-red-500" : "",
      locked ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <MainLayout>
      <div
        className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden p-4 md:p-6"
        style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
      >
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Settings
          </h1>
        </div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : (
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="mb-6 grid h-auto w-full grid-cols-2 gap-2 bg-transparent p-0 sm:grid-cols-4">
              <TabsTrigger
                value="company"
                className="border-l-4 border-transparent py-2.5 text-xs transition-all hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-glow sm:text-sm"
              >
                Company
              </TabsTrigger>
              <TabsTrigger
                value="departments"
                className="border-l-4 border-transparent py-2.5 text-xs transition-all hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-glow sm:text-sm"
              >
                Departments
              </TabsTrigger>
              <TabsTrigger
                value="designations"
                className="border-l-4 border-transparent py-2.5 text-xs transition-all hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-glow sm:text-sm"
              >
                Designations
              </TabsTrigger>
              <TabsTrigger
                value="general"
                className="border-l-4 border-transparent py-2.5 text-xs transition-all hover:bg-primary/10 hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-glow sm:text-sm"
              >
                General
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company">
              <Card className={SETTINGS_CARD}>
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Company Information
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Update your company details and information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-gray-700">
                      Company Name
                    </Label>
                    <Input
                      id="company-name"
                      name="company_name"
                      value={company.company_name || ""}
                      onChange={handleCompanyChange}
                      disabled={companyLocked}
                      className={fieldClass(
                        companyErrors.company_name,
                        companyLocked,
                      )}
                      aria-invalid={!!companyErrors.company_name}
                    />
                    {!companyLocked && companyErrors.company_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {companyErrors.company_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-gray-700">
                      Address
                    </Label>
                    <Textarea
                      id="address"
                      name="company_address"
                      value={company.company_address || ""}
                      onChange={handleCompanyChange}
                      rows={3}
                      disabled={companyLocked}
                      className={fieldClass(
                        companyErrors.company_address,
                        companyLocked,
                      )}
                      aria-invalid={!!companyErrors.company_address}
                    />
                    {!companyLocked && companyErrors.company_address && (
                      <p className="text-red-500 text-xs mt-1">
                        {companyErrors.company_address}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        name="company_phone"
                        value={company.company_phone || ""}
                        onChange={handleCompanyChange}
                        disabled={companyLocked}
                        className={fieldClass(
                          companyErrors.company_phone,
                          companyLocked,
                        )}
                        aria-invalid={!!companyErrors.company_phone}
                      />
                      {!companyLocked && companyErrors.company_phone && (
                        <p className="text-red-500 text-xs mt-1">
                          {companyErrors.company_phone}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        name="company_email"
                        value={company.company_email || ""}
                        onChange={handleCompanyChange}
                        disabled={companyLocked}
                        className={fieldClass(
                          companyErrors.company_email,
                          companyLocked,
                        )}
                        aria-invalid={!!companyErrors.company_email}
                      />
                      {!companyLocked && companyErrors.company_email && (
                        <p className="text-red-500 text-xs mt-1">
                          {companyErrors.company_email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-gray-700">
                        Website
                      </Label>
                      <Input
                        id="website"
                        name="company_website"
                        value={company.company_website || ""}
                        onChange={handleCompanyChange}
                        disabled={companyLocked}
                        className={fieldClass(
                          companyErrors.company_website,
                          companyLocked,
                        )}
                        aria-invalid={!!companyErrors.company_website}
                      />
                      {!companyLocked && companyErrors.company_website && (
                        <p className="text-red-500 text-xs mt-1">
                          {companyErrors.company_website}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="taxId" className="text-gray-700">
                        Tax ID / Registration Number
                      </Label>
                      <Input
                        id="taxId"
                        name="company_gst_no"
                        value={company.company_gst_no || ""}
                        onChange={handleCompanyChange}
                        disabled={companyLocked}
                        className={fieldClass(
                          companyErrors.company_gst_no,
                          companyLocked,
                        )}
                        aria-invalid={!!companyErrors.company_gst_no}
                      />
                      {!companyLocked && companyErrors.company_gst_no && (
                        <p className="text-red-500 text-xs mt-1">
                          {companyErrors.company_gst_no}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center gap-3">
                  {companyLocked ? (
                    <>
                      <Button
                        disabled
                        className="bg-green-100 text-green-700 shadow-none rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto opacity-100 cursor-not-allowed hover:bg-green-100"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submitted
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCompanyLocked(false)}
                        className="border-instattend-300 text-instattend-700 hover:bg-instattend-50 rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={saveCompanyData}
                      disabled={!isCompanyValid || isSavingCompany}
                      className="bg-instattend-600 hover:bg-instattend-700 text-white shadow rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                    >
                      {isSavingCompany ? "Saving..." : "Save Changes"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="departments">
              <Card className={SETTINGS_CARD}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-gray-900">Departments</CardTitle>
                    <CardDescription className="text-gray-500">
                      Manage company departments and teams
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-instattend-600 hover:bg-instattend-700 text-white shadow rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                    onClick={() => setAddDepartmentOpen(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="whitespace-nowrap">Add Department</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-gray-700 font-semibold">
                            Department
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700 font-semibold">
                            Address
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700 font-semibold">
                            Lead
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap text-gray-700 font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((department) => (
                          <TableRow key={department.id}>
                            <TableCell className="whitespace-nowrap text-gray-900 font-medium">
                              {department.department_name}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-gray-700">
                              {department.department_address}
                            </TableCell>
                            <TableCell className="whitespace-nowrap text-gray-700">
                              {department.department_lead || "NA"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                                  onClick={() => {
                                    setSelectedDepartment(department);
                                    setEditDepartmentOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  onClick={() =>
                                    openDeleteConfirm("department", department)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/*Department Forms*/}
              <DepartmentForm
                open={addDepartmentOpen}
                onOpenChange={setAddDepartmentOpen}
                onSubmit={handleAddDepartment}
              />

              <DepartmentForm
                open={editDepartmentOpen}
                onOpenChange={setEditDepartmentOpen}
                department={selectedDepartment}
                onSubmit={handleUpdateDepartment}
              />
            </TabsContent>

            <TabsContent value="designations">
              <Card className={SETTINGS_CARD}>
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-gray-900">
                      Designations
                    </CardTitle>
                    <CardDescription className="text-gray-500">
                      Manage employee roles and designations
                    </CardDescription>
                  </div>
                  <Button
                    className="bg-instattend-600 hover:bg-instattend-700 text-white shadow rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                    onClick={() => setAddDesignationOpen(true)}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    <span className="whitespace-nowrap">Add Designation</span>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table className="min-w-full">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="whitespace-nowrap text-gray-700 font-semibold">
                            Designation
                          </TableHead>
                          <TableHead className="whitespace-nowrap text-gray-700 font-semibold">
                            Have Admin Access
                          </TableHead>
                          <TableHead className="text-right whitespace-nowrap text-gray-700 font-semibold">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {designations.map((designation) => (
                          <TableRow key={designation.id}>
                            <TableCell className="whitespace-nowrap text-gray-900 font-medium">
                              {designation.designation_name}
                            </TableCell>
                            <TableCell className="font-medium text-gray-900">
                              {designation.admin_access ? "Yes" : "No"}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-gray-600 hover:text-gray-900"
                                  onClick={() => {
                                    setSelectedDesignation(designation);
                                    setEditDesignationOpen(true);
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                                  onClick={() =>
                                    openDeleteConfirm(
                                      "designation",
                                      designation,
                                    )
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              {/* Designation forms */}
              <DesignationForm
                open={addDesignationOpen}
                onOpenChange={setAddDesignationOpen}
                onSubmit={handleAddDesignation}
              />

              <DesignationForm
                open={editDesignationOpen}
                onOpenChange={setEditDesignationOpen}
                designation={selectedDesignation}
                onSubmit={handleUpdateDesignation}
              />
            </TabsContent>

            <TabsContent value="general">
              <Card className={SETTINGS_CARD}>
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    General Settings
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Configure system-wide settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="work-hours" className="text-gray-700">
                      Standard Work Hours
                    </Label>
                    <Input
                      id="work-hours"
                      name="standard_work_hours"
                      type="number"
                      min={1}
                      max={24}
                      value={generalSettings.standard_work_hours || ""}
                      onChange={handleGeneralSettingsChange}
                      disabled={generalLocked}
                      className={fieldClass(
                        generalErrors.standard_work_hours,
                        generalLocked,
                      )}
                      aria-invalid={!!generalErrors.standard_work_hours}
                    />
                    {!generalLocked && generalErrors.standard_work_hours && (
                      <p className="text-red-500 text-xs mt-1">
                        {generalErrors.standard_work_hours}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-gray-700">
                      Timezone
                    </Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      value={generalSettings.timezone || ""}
                      onChange={handleGeneralSettingsChange}
                      disabled={generalLocked}
                      className={fieldClass(
                        generalErrors.timezone,
                        generalLocked,
                      )}
                      aria-invalid={!!generalErrors.timezone}
                    />
                    {!generalLocked && generalErrors.timezone && (
                      <p className="text-red-500 text-xs mt-1">
                        {generalErrors.timezone}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="week-start" className="text-gray-700">
                        Week Start Day
                      </Label>
                      <Input
                        id="week-start"
                        name="week_start_day"
                        value={generalSettings.week_start_day || ""}
                        onChange={handleGeneralSettingsChange}
                        placeholder="e.g. Monday"
                        disabled={generalLocked}
                        className={fieldClass(
                          generalErrors.week_start_day,
                          generalLocked,
                        )}
                        aria-invalid={!!generalErrors.week_start_day}
                      />
                      {!generalLocked && generalErrors.week_start_day && (
                        <p className="text-red-500 text-xs mt-1">
                          {generalErrors.week_start_day}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="date-format" className="text-gray-700">
                        Date Format
                      </Label>
                      <Input
                        id="date-format"
                        name="date_format"
                        value={generalSettings.date_format || ""}
                        onChange={handleGeneralSettingsChange}
                        placeholder="e.g. DD/MM/YYYY"
                        disabled={generalLocked}
                        className={fieldClass(
                          generalErrors.date_format,
                          generalLocked,
                        )}
                        aria-invalid={!!generalErrors.date_format}
                      />
                      {!generalLocked && generalErrors.date_format && (
                        <p className="text-red-500 text-xs mt-1">
                          {generalErrors.date_format}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="leave-year" className="text-gray-700">
                      Leave Year Start
                    </Label>
                    <Input
                      id="leave-year"
                      name="leave_year_start"
                      value={generalSettings.leave_year_start || ""}
                      onChange={handleGeneralSettingsChange}
                      disabled={generalLocked}
                      className={fieldClass(
                        generalErrors.leave_year_start,
                        generalLocked,
                      )}
                      aria-invalid={!!generalErrors.leave_year_start}
                    />
                    {!generalLocked && generalErrors.leave_year_start && (
                      <p className="text-red-500 text-xs mt-1">
                        {generalErrors.leave_year_start}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex items-center gap-3">
                  {generalLocked ? (
                    <>
                      <Button
                        disabled
                        className="bg-green-100 text-green-700 shadow-none rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto opacity-100 cursor-not-allowed hover:bg-green-100"
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Submitted
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setGeneralLocked(false)}
                        className="border-instattend-300 text-instattend-700 hover:bg-instattend-50 rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="bg-instattend-600 hover:bg-instattend-700 text-white shadow rounded px-3 py-2 text-sm sm:px-4 sm:py-2 w-full sm:w-auto"
                      onClick={saveGeneralSettings}
                      disabled={!isGeneralValid || isSavingGeneral}
                    >
                      {isSavingGeneral ? "Saving..." : "Save Settings"}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Delete-confirmation modal — shared by Departments & Designations.
          Rendered through a portal straight to document.body instead of
          inline here. MainLayout's <main> carries `animate-fade-in`,
          whose keyframes set a `transform` on it; per the CSS spec, any
          ancestor with a `transform` becomes the containing block for
          `position: fixed` descendants, so a plain inline fixed overlay
          only covers that scrollable <main> box (not the full viewport) —
          which is exactly the partially-dimmed screen seen in the bug
          report. Portaling to document.body escapes that ancestor
          entirely, the same way Radix's DialogPortal does elsewhere in
          this app, so the overlay always covers the whole screen and
          stays centered regardless of scroll position. */}
      {deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/50 p-4">
            <div className="my-auto w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl sm:p-6">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">
                Delete{" "}
                {deleteTarget.type === "department"
                  ? "Department"
                  : "Designation"}
              </h2>
              <p className="text-sm text-gray-700 mb-6">
                Are you sure you want to delete{" "}
                <strong>
                  {deleteTarget.type === "department"
                    ? deleteTarget.item.department_name
                    : deleteTarget.item.designation_name}
                </strong>
                ? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </button>
                <button
                  onClick={closeDeleteConfirm}
                  disabled={isDeleting}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </MainLayout>
  );
};

export default Settings;
