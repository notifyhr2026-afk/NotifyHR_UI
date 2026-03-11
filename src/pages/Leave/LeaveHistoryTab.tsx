import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Alert } from "react-bootstrap";
import { Leave, EmployeeOption, LeaveTypeOption } from "../../types/Leaves";
import leaveService from "../../services/leaveService";

interface Props {
  employeeID: number;
  employees: EmployeeOption[];
  leaveTypes: LeaveTypeOption[];
  onEdit: (leave: Leave) => void;
  onDelete: (id: number) => void;
}

// Robust date formatter for YYYY-MM-DD
const formatDate = (date?: string | null) => {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts.map(Number);
  if (!year || !month || !day) return "";
  return new Date(year, month - 1, day).toLocaleDateString();
};

const LeaveHistoryTab: React.FC<Props> = ({
  employeeID,
  employees,
  leaveTypes,
  onEdit,
  onDelete
}) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadLeaves();
  }, [employeeID]);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveService.GetEmployeeLeavesByAsync(employeeID);

      // Map API response to Leave interface
      const mapped: Leave[] = data.map((l: any) => ({
        id: l.EmployeeLeaveID,
        employeeID: String(l.EmployeeID),
        leaveTypeID: String(l.LeaveTypeID),
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
        halfDayType: l.HalfDayType
      }));

      setLeaves(mapped);
    } catch (error) {
      console.error("Error loading leaves", error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) return <Alert variant="info">Loading leave history...</Alert>;
  if (!leaves.length) return <Alert variant="info">No leaves applied yet.</Alert>;

  return (
    <Table striped bordered hover responsive>
      <thead className="table-dark">
        <tr>
          <th>Leave Type</th>
          <th>Dates</th>
          <th>Days</th>
          <th>reason</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {leaves.map((l) => (
          <tr key={l.id}>
            <td>
              {leaveTypes.find((t) => t.value === l.leaveTypeID)?.label || l.leaveTypeID}
            </td>

            <td>
              {formatDate(l.startDate)}
              {l.startDate && l.endDate ? " → " : ""}
              {formatDate(l.endDate)}
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

            <td>
              <Button size="sm" variant="primary" onClick={() => onEdit(l)}>Edit</Button>{" "}
              <Button size="sm" variant="danger" onClick={() => onDelete(l.id)}>Delete</Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default LeaveHistoryTab;