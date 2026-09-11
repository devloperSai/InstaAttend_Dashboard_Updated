import React, { useState } from 'react';
import { Input } from './input';
import {employeeService} from "../../api/services/employee.service.js";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './Select.jsx'


// Reusable FormField Component
const FormField = ({ label, name, type, placeholder, value, onChange, error }) => (
    <div>
      <label className="block text-sm font-medium mb-1" htmlFor={name}>{label}</label>
      <Input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${
              error ? 'border-red-500 focus:ring-red-500' : 'focus:ring-instattend-500'
          }`}
          aria-invalid={!!error}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
);


const AddEmployeeForm = ({ onClose, departments, designation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    designation_id: '',
    password: '',
  });

  const departmentOptions = departments.map(dept => ({
    label: dept.department_name,
    value: dept.id // or dept.department_id depending on your data
  }));

  const designationOptions = designation.map(desig => ({
    label: desig.designation_name,
    value: desig.id
  }));

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };


  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Employee name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!formData.department_id) newErrors.department_id = 'Department is required';
    if (!String(formData.designation_id || "").trim()) newErrors.designation_id = 'Designation is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const employee = {
        username: formData.name,
        email: formData.email,
        phone_number: formData.phone,
        department_id: formData.department_id,
        designation_id: formData.designation_id,
        password: formData.password
      }
      employeeService.addOne(employee).then(res => {
        console.log(res);
        setFormData({
          name: '',
          email: '',
          phone: '',
          department_id: '',
          designation_id: '',
          password: '',
        });
      });
      onClose();
    }
  };

  return (
      <form onSubmit={handleSubmit} className="space-y-5 text-base w-full max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Add New Employee</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">
            ×
          </button>
        </div>

        {/* Input Fields */}
        {[
          { label: 'Employee Name', name: 'name', type: 'text', placeholder: 'Full Name' },
          { label: 'Email', name: 'email', type: 'email', placeholder: 'Email Address' },
          { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: 'Phone Number' },
          { label: 'Password', name: 'password', type: 'password', placeholder: 'Password' },
        ].map((field) => (
            <FormField
                key={field.name}
                {...field}
                value={formData[field.name]}
                onChange={handleChange}
                error={errors[field.name]}
            />
        ))}

        {/* Designation Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Designation</label>
          <Select
              value={formData.designation_id}
              onValueChange={(value) => handleSelectChange("designation_id", value)}
          >
            <SelectTrigger className={errors.designation_id ? "border-red-500 focus:ring-red-500" : ""}>
              <SelectValue placeholder="Select Designation" />
            </SelectTrigger>
            <SelectContent>
              {designationOptions.map((design) => (
                  <SelectItem key={design.value} value={design.value}>
                    {design.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.designation_id && (
              <p className="text-red-500 text-sm mt-1">{errors.designation_id}</p>
          )}
        </div>

        {/* Department Dropdown */}
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <Select
              value={formData.department_id}
              onValueChange={(value) => handleSelectChange("department_id", value)}
          >
            <SelectTrigger className={errors.department_id ? "border-red-500 focus:ring-red-500" : ""}>
              <SelectValue placeholder="Select Department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department_id && (
              <p className="text-red-500 text-sm mt-1">{errors.department_id}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button type="submit" className="px-5 py-2 bg-instattend-600 text-white rounded-md hover:bg-instattend-700">
            Add Employee
          </button>
        </div>
      </form>
  );
};

export default AddEmployeeForm;