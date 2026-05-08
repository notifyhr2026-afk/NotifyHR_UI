import React, { useState } from 'react';
import { Button, Table, Form, Spinner } from 'react-bootstrap';
import * as XLSX from 'xlsx';
import employeeService from '../../services/employeeService';
import { toast } from 'react-toastify';

const EmployeeImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ===== FILE READ =====
  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    setFile(file);

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (evt: any) => {
      const wb = XLSX.read(evt.target.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(ws);

      setData(jsonData);
    };
  };

  // ===== VALIDATE =====
  const handleValidate = () => {
    if (data.length === 0) {
      toast.error('No data to validate');
      return;
    }

    let isValid = true;

    data.forEach((row, index) => {
      if (!row.employeeCode || !row.firstName) {
        isValid = false;
      }
    });

    if (isValid) {
      toast.success('Validation successful');
    } else {
      toast.error('Validation failed: Missing required fields');
    }
  };

  // ===== IMPORT =====
  const handleImport = async () => {
    if (data.length === 0) {
      toast.error('No data to import');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        organizationID: user.organizationID,
        jsonData: JSON.stringify(data),
        createdBy: user.username || 'admin',
      };

      const res = await employeeService.ImportEmployeesAsync(payload);

      toast.success('Import completed');
    } catch (err) {
      toast.error('Import failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Import Employees</h3>

      {/* FILE UPLOAD */}
      <Form.Group className="mb-3">
        <Form.Label>Upload Excel</Form.Label>
        <Form.Control type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
      </Form.Group>

      {/* ACTION BUTTONS */}
      <div className="mb-3">
        <Button variant="secondary" onClick={handleValidate} className="me-2">
          Validate
        </Button>

        <Button variant="primary" onClick={handleImport} disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Import'}
        </Button>
      </div>

      {/* TABLE PREVIEW */}
      {data.length > 0 && (
        <Table bordered striped>
          <thead>
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th key={key}>{key}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.slice(0, 20).map((row, i) => (
              <tr key={i}>
                {Object.values(row).map((val: any, idx) => (
                  <td key={idx}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default EmployeeImport;