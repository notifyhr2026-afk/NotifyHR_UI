import React, { useEffect, useState } from "react";
import employeeService from '../../services/employeeService';

interface EmployeeProfile {
  EmployeeID: number;
  EmployeeCode: string;
  EmployeeName: string;
  Gender: string;
  MaritalStatus: string;
  DateOfJoining: string;
  PersonalPhone: string;
  PersonalEmail: string;
  EffectiveFrom: string;
  IsCurrent: boolean;
  EmploymentTypeName: string;
  PositionTitle: string;
  DepartmentName: string;
  DivisionName: string;
  BranchName: string;
  ReportingManagerCode: string;
  ReportingManagerName: string;
  BloodGroup: string | null;
}

const MyProfile: React.FC = () => {
  const data: any = localStorage.getItem("user");
  const user = JSON.parse(data || "{}");

  const organizationID = user?.organizationID || 0;
  const EmployeeID = user?.employeeID || 0;

  const [employee, setEmployee] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchEmployeeProfile();
  }, []);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      // Change this URL to your API endpoint
      const response = await employeeService.GetEmployeeProfileAsync(organizationID, EmployeeID);
        setEmployee(response[0]);
    } catch (err) {
      console.error(err);
      setError("Failed to load employee profile.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-GB");
  };

  const InfoRow = ({
    label,
    value,
  }: {
    label: string;
    value: string | number | null | undefined;
  }) => (
    <div className="col-md-6 mb-3">
      <label className="text-muted small fw-semibold">{label}</label>
      <div className="fw-semibold">{value || "-"}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container py-5">
        <div className="alert alert-warning">No employee data found.</div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <div className="card border-0 shadow rounded-4">
        <div className="card-header bg-primary text-white rounded-top-4 py-3">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div>
              <h4 className="mb-1">{employee.EmployeeName}</h4>
              <p className="mb-0">
                {employee.PositionTitle} | {employee.DepartmentName}
              </p>
            </div>

            <span
              className={`badge ${
                employee.IsCurrent ? "bg-success" : "bg-danger"
              } fs-6`}
            >
              {employee.IsCurrent ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        <div className="card-body p-4">
          <h5 className="fw-bold mb-4">
            <i className="bi bi-briefcase-fill text-primary me-2"></i>
            Job Details
          </h5>

          <div className="row">
            <InfoRow
              label="Employee Code"
              value={employee.EmployeeCode}
            />

            <InfoRow
              label="Employee Name"
              value={employee.EmployeeName}
            />

            <InfoRow
              label="Position"
              value={employee.PositionTitle}
            />

            <InfoRow
              label="Employment Type"
              value={employee.EmploymentTypeName}
            />

            <InfoRow
              label="Department"
              value={employee.DepartmentName}
            />

            <InfoRow
              label="Division"
              value={employee.DivisionName}
            />

            <InfoRow
              label="Branch"
              value={employee.BranchName}
            />

            <InfoRow
              label="Reporting Manager"
              value={employee.ReportingManagerName}
            />

            <InfoRow
              label="Reporting Manager Code"
              value={employee.ReportingManagerCode}
            />

            <InfoRow
              label="Date Of Joining"
              value={formatDate(employee.DateOfJoining)}
            />

            <InfoRow
              label="Effective From"
              value={formatDate(employee.EffectiveFrom)}
            />

            <InfoRow
              label="Gender"
              value={employee.Gender}
            />

            <InfoRow
              label="Marital Status"
              value={employee.MaritalStatus}
            />

            <InfoRow
              label="Blood Group"
              value={employee.BloodGroup}
            />

            <InfoRow
              label="Personal Email"
              value={employee.PersonalEmail}
            />

            <InfoRow
              label="Personal Phone"
              value={employee.PersonalPhone}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;