import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";

const CompanyTab = ({ company, handleCompanyChange, saveCompanyData }) => {
  const [errors, setErrors] = useState({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    taxId: ''
  });

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'name':
        if (!value.trim()) error = 'Company name is required';
        else if (value.length > 100) error = 'Name must be less than 100 characters';
        break;
      case 'address':
        if (!value.trim()) error = 'Address is required';
        else if (value.length > 200) error = 'Address must be less than 200 characters';
        break;
      case 'phone':
        if (!value.trim()) error = 'Phone number is required';
        else if (!/^\+?\d{10,15}$/.test(value)) error = 'Please enter a valid phone number';
        break;
      case 'email':
        if (!value.trim()) error = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = 'Please enter a valid email';
        break;
      case 'website':
        if (!value.trim()) error = 'Website is required';
        else if (!/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(value)) {
          error = 'Please enter a valid website URL';
        }
        break;
      case 'taxId':
        if (!value.trim()) error = 'Tax ID is required';
        else if (!/^[A-Za-z0-9-]{5,20}$/.test(value)) error = 'Please enter a valid Tax ID';
        break;
      default:
        break;
    }

    return error;
  };

  const handleChangeWithValidation = (e) => {
    const { name, value } = e.target;
    handleCompanyChange(e);
    
    // Validate the field and update errors
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSave = () => {
    // Validate all fields before saving
    const newErrors = {};
    let isValid = true;

    Object.keys(company).forEach(key => {
      const error = validateField(key, company[key]);
      newErrors[key] = error;
      if (error) isValid = false;
    });

    setErrors(newErrors);

    if (isValid) {
      saveCompanyData();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-4 sm:pb-6">
        <CardTitle className="text-xl">Company Information</CardTitle>
        <CardDescription className="mt-2">
          Update your company details and information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            name="name"
            value={company.name}
            onChange={handleChangeWithValidation}
            className="w-full"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        <div className="space-y-3">
          <Label htmlFor="address">Address</Label>
          <Textarea
            id="address"
            name="address"
            value={company.address}
            onChange={handleChangeWithValidation}
            rows={3}
            className="w-full"
            required
          />
          {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={company.phone}
              onChange={handleChangeWithValidation}
              className="w-full"
              required
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={company.email}
              onChange={handleChangeWithValidation}
              className="w-full"
              required
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              value={company.website}
              onChange={handleChangeWithValidation}
              className="w-full"
              required
            />
            {errors.website && <p className="text-red-500 text-sm mt-1">{errors.website}</p>}
          </div>
          <div className="space-y-3">
            <Label htmlFor="taxId">Tax ID / Registration Number</Label>
            <Input
              id="taxId"
              name="taxId"
              value={company.taxId}
              onChange={handleChangeWithValidation}
              className="w-full"
              required
            />
            {errors.taxId && <p className="text-red-500 text-sm mt-1">{errors.taxId}</p>}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 sm:pt-6">
        <Button 
          onClick={handleSave} 
          className="bg-instattend-500 hover:bg-instattend-600 w-full sm:w-auto"
        >
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyTab;