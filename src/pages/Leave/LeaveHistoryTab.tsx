import React, { useEffect, useState } from "react";
import { Table, Button, Badge, Spinner, Alert, Card } from "react-bootstrap";
import { Leave, LeaveTypeOption } from "../../types/Leaves";
import leaveService from "../../services/leaveService";
import ApplyLeaveModal from "./ApplyLeaveModal";

interface Props {
  employeeID: number;
  leaveTypes: LeaveTypeOption[];
  onDelete: (id: number) => void;
}

const formatDate = (date?: string | null) => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString();
};

const LeaveHistoryTab: React.FC<Props> = ({ employeeID, leaveTypes, onDelete }) => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Modal State
  const [showModal, setShowModal] = useState(false);
  const [editLeave, setEditLeave] = useState<Leave | null>(null);

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
    } catch {
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

  // ✅ Open Edit Modal
  const handleEditClick = (leave: Leave) => {
    setEditLeave(leave);
    setShowModal(true);
  };

  // ✅ After Save (Create or Update)
  const handleSave = (updatedLeave: Leave) => {
    setLeaves((prev) => {
      const exists = prev.some((l) => l.id === updatedLeave.id);

      if (exists) {
        // update
        return prev.map((l) =>
          l.id === updatedLeave.id ? updatedLeave : l
        );
      } else {
        // new
        return [updatedLeave, ...prev];
      }
    });
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
        <Spinner animation="border" />
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!leaves.length) return <Alert variant="info">No leaves applied yet.</Alert>;

  return (
    <>
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
                    <td>
                      {leaveTypes.find((t) => t.value === l.leaveTypeID)?.label ||
                        l.leaveTypeID}
                    </td>

                    <td>
                      {formatDate(l.startDate)}{" "}
                      {l.startDate && l.endDate ? "→" : ""}{" "}
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

                    {/* ✅ Actions */}
                    <td>
                      {l.status === "Pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="primary"
                            className="me-2"
                            onClick={() => handleEditClick(l)}
                          >
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => onDelete(l.id)}
                          >
                            Delete
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* ✅ Reusable Modal */}
      <ApplyLeaveModal
        show={showModal}
        onHide={() => setShowModal(false)}
        editLeave={editLeave}
        onSave={handleSave}
      />
    </>
  );
};

export default LeaveHistoryTab;