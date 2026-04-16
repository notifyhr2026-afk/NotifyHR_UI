// LeaveHistoryTab.tsx
import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Spinner, Alert, Card } from "react-bootstrap";
import { Leave, LeaveTypeOption } from "../../types/Leaves";
import leaveService from "../../services/leaveService";

interface Props {
  employeeID: number;
  leaveTypes: LeaveTypeOption[];
  onEdit: (leave: Leave) => void;
  onDelete: (id: number) => void;
}

// Format YYYY-MM-DD to locale date
const formatDate = (date?: string | null) => {
  if (!date) return "";
  const parts = date.split("-");
  if (parts.length !== 3) return "";
  const [year, month, day] = parts.map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
};

const LeaveHistoryTab: React.FC<Props> = ({ employeeID, leaveTypes, onEdit, onDelete }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetchLeaves();
  }, [employeeID]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const data = await leaveService.GetEmployeeLeavesByAsync(employeeID);
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
        halfDayType: l.HalfDayType,
      }));
      setLeaves(mapped);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load leave history.");
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

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!leaves.length) return <Alert variant="info">No leaves applied yet.</Alert>;

  return (
    <Card className="shadow-sm mb-4">    
      <Card.Body>
        <div className="table-responsive">
          <Table className="table table-hover table-dark-custom">
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Dates</th>
                <th>Days</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((l) => (
                <tr key={l.id}>
                  <td>{leaveTypes.find((t) => t.value === l.leaveTypeID)?.label || l.leaveTypeID}</td>

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
                    <Button size="sm" variant="primary" className="me-2" onClick={() => onEdit(l)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => onDelete(l.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LeaveHistoryTab;