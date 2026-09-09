import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

const BulkUpload = ({ onUpload }) => {
  const [employees, setEmployees] = useState([]);
  const [fileName, setFileName] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const requiredFields = ['Name', 'Email', 'Phone', 'Designation ID', 'Department ID'];

  const validateData = (data) => {
    const missingHeaders = requiredFields.filter(
      (field) => !Object.keys(data[0] || {}).includes(field)
    );
    if (missingHeaders.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingHeaders.join(', ')}.`,
      };
    }

    for (let i = 0; i < data.length; i++) {
      for (const field of requiredFields) {
        const value = data[i][field];

        // Check if empty
        if (!value || value.toString().trim() === '') {
          return {
            isValid: false,
            error: `Line ${i + 2} is missing or has empty value for field: "${field}".`,
          };
        }

        // Additional validation
        if (field === 'Phone') {
          const phoneStr = value.toString().trim();
          if (!/^\d{10}$/.test(phoneStr)) {
            return {
              isValid: false,
              error: `Line ${i + 2}: Invalid phone number "${phoneStr}". It should be exactly 10 digits.`,
            };
          }
        }
        if (field === 'Email') {
          const email = value.toString().trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return {
              isValid: false,
              error: `Row ${i + 2}: Invalid email "${email}". Email format is incorrect.`,
            };
          }
        }
      }
    }

    return { isValid: true };
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setSuccessMessage('');
    setErrorMessage('');

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      const { isValid, error } = validateData(jsonData);

      if (!isValid) {
        setEmployees([]);
        setErrorMessage(error);
        return;
      }

      // Transform the keys of the parsed data to match the expected structure
      const transformedData = jsonData.map((item) => ({
        username: item['Name'],
        email: item['Email'],
        password: '123456',
        phone_number: item['Phone'],
        designation_id: item['Designation ID'],
        department_id: item['Department ID'],
      }));

      setEmployees(transformedData);
      setSuccessMessage('✅ File uploaded and data successfully parsed!');
      setErrorMessage('');
      console.log("✅ Transformed JSON Data:", transformedData);
    };

    reader.readAsArrayBuffer(file);
  };


  const handleSubmit = () => {
    if (employees.length === 0) {
      setErrorMessage("No valid data to upload.");
      return;
    }

    onUpload?.(employees);
    setSuccessMessage('✅ File uploaded successfully!');
    setErrorMessage('');
    setEmployees([]);
    setFileName('');
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-4 border rounded-md shadow-sm max-w-2xl mx-auto mt-6">
      <h2 className="text-xl font-semibold mb-4 text-center">Bulk Upload Employees from Excel</h2>

      <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      <div className="text-center">
        <button
          type="button"
          onClick={handleBrowseClick}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-2"
        >
          Choose Excel File
        </button>
      </div>

      {fileName && (
        <p className="text-sm text-gray-700 mb-4 text-center">
          📄 Selected File: <strong>{fileName}</strong>
        </p>
      )}

      {errorMessage && (
        <div className="mt-4 text-center text-red-600 font-medium">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="mt-4 text-center text-green-600 font-semibold">{successMessage}</div>
      )}

      {employees.length > 0 && (
        <div className="overflow-auto max-h-64 mb-4 border rounded-md">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                {Object.keys(employees[0]).map((key) => (
                  <th key={key} className="p-2 border">{key}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, idx) => (
                <tr key={idx}>
                  {Object.values(emp).map((val, i) => (
                    <td key={i} className="p-2 border">{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-center mt-4">
        <button
          onClick={handleSubmit}
          className="px-5 py-2 bg-instattend-600 text-white rounded-md hover:bg-instattend-700"
        >
          Upload Employees
        </button>
      </div>
    </div>
  );
};

export default BulkUpload;
