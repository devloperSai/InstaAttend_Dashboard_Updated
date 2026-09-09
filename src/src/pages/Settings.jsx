import { useEffect, useState, useCallback } from "react";
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
import { Pencil, Plus, Trash2 } from "lucide-react";
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
import { useToast } from "../hooks/user-toast.js";
import { departmentService } from "../api/services/department.service.js";
import { designationService } from "../api/services/designation.service.js";
import SettingsSkeleton from "../components/skeleton/SettingsSkeleton.jsx";

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
  const { toast } = useToast();

  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const saveCompanyData = async () => {
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

      if (company.id) {
        await settingService.updateSettings(company.id, payload);
      } else {
        await settingService.createSetting(payload);
      }
      fetchSettings();
    } catch (err) {
      toast.error("Error saving company data");
      console.error(err);
    }
  };

  const handleAddDepartment = async (department) => {
    try {
      const departmentData = {
        department_name: department.name,
        department_lat_long: department.coordinates,
        department_address: department.address,
        ...(department.lead ? { department_lead: department.lead } : {}),
      };
      await departmentService.createDepartment(departmentData);
      toast("Department added successfully");
      fetchDepartments();
    } catch (err) {
      toast.error("Error adding department");
      throw err;
    }
  };

  const handleUpdateDepartment = async (department) => {
    try {
      const updatedDepartment = {
        ...(department.name ? { department_name: department.name } : {}),
        ...(department.coordinates
          ? { department_lat_long: department.coordinates }
          : {}),
        ...(department.address
          ? { department_address: department.address }
          : {}),
        ...(department.lead ? { department_lead: department.lead } : {}),
      };
      await departmentService.updateDepartment(
        department.id,
        updatedDepartment
      );
      toast("Department updated successfully");
      fetchDepartments();
    } catch (err) {
      toast.error("Error updating department");
      throw err;
    }
  };

  const handleAddDesignation = async (designation) => {
    try {
      const designationData = {
        designation_name: designation.name,
        admin_access: designation.admin_access,
      };
      await designationService.createDesignation(designationData);
      fetchDesignations();
    } catch (err) {
      toast.error("Error adding designation");
      throw err;
    }
  };

  const handleUpdateDesignation = async (designation) => {
    try {
      const updatedDesignation = {
        ...(designation.name ? { designation_name: designation.name } : {}),
        admin_access: designation.admin_access,
      };
      await designationService.updateDesignation(
        designation.id,
        updatedDesignation
      );
      fetchDesignations();
    } catch (err) {
      toast.error("Error updating designation");
      throw err;
    }
  };

  // Add a handler for general settings input changes
  const handleGeneralSettingsChange = (e) => {
    const { name, value } = e.target;
    setGeneralSettings((prev) => ({ ...prev, [name]: value }));
  };

  // Create a new function to save general settings
  const saveGeneralSettings = async () => {
    try {
      const payload = {
        type: "general_settings",
        config: generalSettings,
      };

      if (generalSettings.id) {
        await settingService.updateSettings(generalSettings.id, payload);
      } else {
        await settingService.createSetting(payload);
      }
      toast("General settings saved successfully!");
      fetchSettings();
    } catch (err) {
      toast.error("Error saving general settings");
      console.error(err);
    }
  };

  const fetchSettings = useCallback(async () => {
    try {
      const settings = await settingService.getAll();

      // Filter settings by type
      const companySettings = settings
        .filter((item) => item.type === "company_information")
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0]; // get latest

      const generalSettings = settings.find(
        (item) => item.type === "general_settings"
      );

      // Set state
      if (companySettings) {
        setCompany(companySettings.config);
      }

      if (generalSettings) {
        setGeneralSettings(generalSettings.config);
      }
    } catch (e) {
      toast.error("Error fetching settings");
      throw e;
    }
  }, [toast]);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err) {
      toast.error("Error fetching departments");
      throw err;
    }
  }, [toast]);

  const fetchDesignations = useCallback(async () => {
    try {
      const data = await designationService.getDesignations();
      setDesignations(data);
    } catch (err) {
      toast.error("Error fetching designations");
      throw err;
    }
  }, [toast]);

  useEffect(() => {
    setIsLoading(true);
    fetchSettings()
      .then(async () => {
        await fetchDepartments();
        await fetchDesignations();
      })
      .finally(() => setIsLoading(false));
  }, [fetchSettings, fetchDepartments, fetchDesignations]);

  return (
    <MainLayout>
      <div
        className="-m-6 min-h-[calc(100vh-4rem)] p-4 md:p-6"
        style={{ backgroundColor: "hsl(var(--dashboard-bg))" }}
      >
        <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Settings
          </h1>
        </div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : (
        <Tabs defaultValue="company" className="w-full px-2 sm:px-0">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
            <TabsTrigger value="company" className="text-xs sm:text-sm">
              Company
            </TabsTrigger>
            <TabsTrigger value="departments" className="text-xs sm:text-sm">
              Departments
            </TabsTrigger>
            <TabsTrigger value="designations" className="text-xs sm:text-sm">
              Designations
            </TabsTrigger>
            <TabsTrigger value="general" className="text-xs sm:text-sm">
              General
            </TabsTrigger>
          </TabsList>

          <TabsContent value="company">
            <Card className="glass-panel border border-white/60">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Company Information
                </CardTitle>
                <CardDescription>
                  Update your company details and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    name="company_name"
                    value={company.company_name || ""}
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    name="company_address"
                    value={company.company_address || ""}
                    onChange={handleCompanyChange}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      name="company_phone"
                      value={company.company_phone || ""}
                      onChange={handleCompanyChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="company_email"
                      value={company.company_email || ""}
                      onChange={handleCompanyChange}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="company_website"
                      value={company.company_website || ""}
                      onChange={handleCompanyChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID / Registration Number</Label>
                    <Input
                      id="taxId"
                      name="company_gst_no"
                      value={company.company_gst_no || ""}
                      onChange={handleCompanyChange}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={saveCompanyData}
                  className="bg-instattend-500 hover:bg-instattend-600 w-full sm:w-auto"
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="departments">
            <Card className="glass-panel border border-white/60">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">
                    Departments
                  </CardTitle>
                  <CardDescription>
                    Manage company departments and teams
                  </CardDescription>
                </div>
                <Button
                  className="bg-instattend-500 hover:bg-instattend-600 w-full sm:w-auto"
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
                        <TableHead className="whitespace-nowrap">
                          Department
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Address
                        </TableHead>
                        <TableHead className="whitespace-nowrap">Lead</TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {departments.map((department) => (
                        <TableRow key={department.id}>
                          <TableCell className="whitespace-nowrap">
                            {department.department_name}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {department.department_address}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {department.department_lead || "NA"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
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
            <Card className="glass-panel border border-white/60">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">
                    Designations
                  </CardTitle>
                  <CardDescription>
                    Manage employee roles and designations
                  </CardDescription>
                </div>
                <Button
                  className="bg-instattend-500 hover:bg-instattend-600 w-full sm:w-auto"
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
                        <TableHead className="whitespace-nowrap">
                          Designation
                        </TableHead>
                        <TableHead className="whitespace-nowrap">
                          Have Admin Access
                        </TableHead>
                        <TableHead className="text-right whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {designations.map((designation) => (
                        <TableRow key={designation.id}>
                          <TableCell className="whitespace-nowrap">
                            {designation.designation_name}
                          </TableCell>
                          <TableCell className="font-medium">
                            {designation.admin_access ? "Yes" : "No"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
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
            <Card className="glass-panel border border-white/60">
              <CardHeader>
                <CardTitle className="text-foreground">
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure system-wide settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="work-hours">Standard Work Hours</Label>
                  <Input
                    id="work-hours"
                    name="standard_work_hours"
                    type="number"
                    value={generalSettings.standard_work_hours || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    name="timezone"
                    value={generalSettings.timezone || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="week-start">Week Start Day</Label>
                    <Input
                      id="week-start"
                      name="week_start_day"
                      value={generalSettings.week_start_day || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-format">Date Format</Label>
                    <Input
                      id="date-format"
                      name="date_format"
                      value={generalSettings.date_format || ""}
                      onChange={handleGeneralSettingsChange}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leave-year">Leave Year Start</Label>
                  <Input
                    id="leave-year"
                    name="leave_year_start"
                    value={generalSettings.leave_year_start || ""}
                    onChange={handleGeneralSettingsChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="bg-instattend-500 hover:bg-instattend-600 w-full sm:w-auto"
                  onClick={saveGeneralSettings}
                >
                  Save Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

export default Settings;