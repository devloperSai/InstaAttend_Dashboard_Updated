//updated code
import React, { useEffect, useState } from "react";
import { Input } from "./input";
import { employeeService } from "../../api/services/employee.service.js";

const UpdateEmployeeForm = ({ onClose, selectedEmployee, departments, designation }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    status: "",
    geofencing: "",
    designation: ""
  });

  const [errors, setErrors] = useState({});


  const updateEmployee = async (updatedEmployee) => {
    try {
      const response = await employeeService.updateOne(updatedEmployee);
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  }



  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.username || "",
        email: selectedEmployee.email || "",
        phone: selectedEmployee.phone_number || "",
        department_id: selectedEmployee.department_id || "",  // use id, not name
        status: selectedEmployee.is_enrolled ? "Active" : "Inactive",
        geofencing: selectedEmployee.geofencing ? "On" : "Off",
        designation_id: selectedEmployee.designation_id || "",
      });
    }
  }, [selectedEmployee]);


  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name must contain only letters and spaces";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone number must be 10 digits";
    }

    if (!String(formData.department_id || "").trim()) newErrors.department_id = "Department is required";
    if (!formData.status) newErrors.status = "Enrollment status is required";
    if (!formData.geofencing) newErrors.geofencing = "Geofencing is required";
    if (!String(formData.designation_id || "").trim()) newErrors.designation_id = "Designation is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const employee = {
        id: selectedEmployee.id,
        username: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        department_id: formData.department_id,
        is_enrolled: formData.status === "Active",
        geofencing: formData.geofencing === "On",
        designation_id: formData.designation_id
      };

      updateEmployee(employee).then(() => {
        console.log("Updated Employee Data:", employee);
      });

      onClose();
    }
  };


  const departmentOptions = (departments || []).map(dept => ({
    label: dept.department_name,
    value: dept.id // or dept.department_id depending on your data
  }));

  const designationOptions = (designation || []).map(desig => ({
    label: desig.designation_name,
    value: desig.id
  }));



  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50 p-4">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">Update Employee</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form Scrollable Content */}
        <div className="p-6 overflow-y-auto">
          <form className="space-y-5 text-base" onSubmit={handleSubmit}>
            <FormInput
              label="Employee Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Full Name"
            />

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="Email Address"
            />

            <FormInput
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Phone Number"
            />

            <FormSelect
                label="Department"
                name="department_id"
                value={formData.department_id}  // use correct field from formData
                onChange={handleChange}
                error={errors.department_id}
                options={departmentOptions}
                placeholder="Select department"
            />


            <FormSelect
              label="Enrollment Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              error={errors.status}
              options={["Active", "Inactive"]}
              placeholder="Select status"
            />

            <FormSelect
              label="Geofencing"
              name="geofencing"
              value={formData.geofencing}
              onChange={handleChange}
              error={errors.geofencing}
              options={["On", "Off"]}
              placeholder="Select geofencing"
            />

            <FormSelect
                label="Designation"
                name="designation_id"
                value={formData.designation_id}  // use correct field from formData
                onChange={handleChange}
                error={errors.designation_id}
                options={designationOptions}
                placeholder="Select designation"
            />

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-instattend-600 text-white rounded-md hover:bg-instattend-700"
              >
                Update Employee
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Reusable input component
const FormInput = ({ label, name, type = "text", value, onChange, error, placeholder }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <Input
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={error ? "border-red-500 focus-visible:ring-red-500" : ""}
    />
    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
  </div>
);

// Reusable select component
const FormSelect = ({ label, name, value, onChange, error, options, placeholder }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              error ? "border-red-500 focus:ring-red-500" : "focus:ring-instattend-500"
          }`}
      >
        <option value="" disabled hidden>
          {placeholder}
        </option>
        {options.map((opt, idx) => {
          // If option is an object with label and value, render accordingly
          if (typeof opt === "object" && opt !== null && "label" in opt && "value" in opt) {
            return (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
            );
          }
          // Otherwise, assume it's a string
          return (
              <option key={opt + idx} value={opt}>
                {opt}
              </option>
          );
        })}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);


export default UpdateEmployeeForm;
