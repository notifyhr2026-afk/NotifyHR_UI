// src/pages/Leave/EmployeeLeavesTab.tsx
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { Table, Badge, Spinner, Alert, Card } from "react-bootstrap";
import { Leave, LeaveTypeOption } from "../../types/Leaves";
import employeeService from "../../services/employeeService";
import leaveService from "../../services/leaveService";

// -------------------- Types --------------------
type EmployeeOption = {
  value: number;
  label: string;
};

type ReportedEmployee = {
  EmployeeID: number;
  EmployeeName: string;
};

// -------------------- Component Props --------------------
interface Props {
  leaveTypes: LeaveTypeOption[];
}

// -------------------- Component --------------------
const EmployeeLeavesTab: React.FC<Props> = ({ leaveTypes }) => {
  const [employee, setEmployee] = useState<EmployeeOption | null>(null);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // Logged-in user
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const employeeID: number | undefined = user?.employeeID;

  // -------------------- Fetch Reported Employees --------------------
  useEffect(() => {
    if (!employeeID) {
      setError("User not found.");
      setLoading(false);
      return;
    }

    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const data: ReportedEmployee[] =
          await employeeService.GetReportedEmployeesAsync(employeeID);

        setEmployees(
          data.map((e) => ({
            value: e.EmployeeID,
            label: e.EmployeeName,
          }))
        );
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load employees.");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [employeeID]);

  // -------------------- Fetch Leaves when Employee selected --------------------
  useEffect(() => {
    if (!employee) {
      setLeaves([]);
      return;
    }

    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const data = await leaveService.GetEmployeeLeavesByAsync(employee.value);

        const mapped: Leave[] = data.map((l: any) => ({
          id: l.EmployeeLeaveID,
          employeeID: l.EmployeeID,
          leaveTypeID: l.LeaveTypeID,
          startDate: l.StartDate,
          endDate: l.EndDate,
          numberOfDays: l.NumberOfDays,
          status:
            l.LeaveStatusID === 1
              ? "Approved"
              : l.LeaveStatusID === 2
              ? "Rejected"
              : "Pending",
          reason: l.Reason,
          isHalfDay: l.IsHalfDay,
          halfDayType: l.HalfDayType,
        }));

        setLeaves(mapped);
      } catch (err: any) {
        console.error(err);
        setError(err?.message || "Failed to load leaves.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaves();
  }, [employee]);

  // -------------------- UI Helpers --------------------
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Rejected":
        return "danger";
      default:
        return "warning";
    }
  };

  // -------------------- Render --------------------
  if (loading)
    return (
      <div className="d-flex justify-content-center mt-4">
        <Spinner animation="border" />
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card className="shadow-sm">
      <Card.Body>
        {/* 🔹 Dropdown */}
        <Select
          options={employees}
          value={employee}
          onChange={(val) => setEmployee(val)}
          placeholder="Select employee..."
          isClearable
        />

        {/* 🔹 No Data */}
        {employee && leaves.length === 0 && (
          <Alert variant="info" className="mt-3">
            No leaves found for selected employee.
          </Alert>
        )}

        {/* 🔹 Table */}
        {leaves.length > 0 && (
          <div className="table-responsive mt-3">
            <Table bordered hover striped>
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {leaves.map((l) => (
                  <tr key={l.id}>
                    <td>
                      {leaveTypes.find((t) => t.value === l.leaveTypeID)?.label ||
                        "N/A"}
                    </td>

                    <td>
                      {l.startDate} → {l.endDate}
                      {l.isHalfDay && (
                        <span className="text-muted ms-1">
                          ({l.halfDayType === "FirstHalf" ? "Morning" : "Afternoon"})
                        </span>
                      )}
                    </td>

                    <td>{l.numberOfDays}</td>
                    <td>{l.reason}</td>
                    <td>
                      <Badge bg={getStatusBadge(l.status)}>{l.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default EmployeeLeavesTab;