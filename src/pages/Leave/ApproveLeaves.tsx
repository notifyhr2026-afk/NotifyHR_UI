import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Spinner,
  Alert,
  Card,
  Badge,
  Modal,
  Form,
} from "react-bootstrap";
import leaveService from "../../services/leaveService";
import { fireAudit } from "../../utils/auditUtils";

type Leave = {
  id: number;
  organizationID: number;
  employeeID: number;
  employeeName: string;
  leaveTypeID: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
  isHalfDay: boolean;
};

type LeaveAPI = {
  OrganizationID: number;
  EmployeeLeaveID: number;
  EmployeeID: number;
  EmployeeName: string;
  LeaveTypeID: number;
  LeaveTypeName: string;
  StartDate: string;
  EndDate: string;
  NumberOfDays: number;
  LeaveStatusID: number;
  Reason: string;
  IsHalfDay: boolean;
};

const formatDate = (date?: string | null) => {
  if (!date) return "";

  const [year, month, day] = date.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString();
};

const ApproveLeaves: React.FC = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const organizationID: number | undefined = user?.organizationID;
  const employeeID: number | undefined = user?.employeeID;

  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Reject Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveID, setSelectedLeaveID] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState("");

  useEffect(() => {
    if (!employeeID) {
      setError("User information not found.");
      setLoading(false);
      return;
    }

    fetchLeaves();
  }, [employeeID]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);

      const leavesData: LeaveAPI[] =
        await leaveService.GetAllPendingLeavesByAsync(
          organizationID || 0
        );

      const mapped: Leave[] = leavesData.map((l) => ({
        id: l.EmployeeLeaveID,
        organizationID: l.OrganizationID,
        employeeID: l.EmployeeID,
        employeeName: l.EmployeeName,
        leaveTypeID: l.LeaveTypeID,
        leaveTypeName: l.LeaveTypeName,
        startDate: l.StartDate,
        endDate: l.EndDate,
        numberOfDays: l.NumberOfDays,
        status:
          l.LeaveStatusID === 0
            ? "Pending"
            : l.LeaveStatusID === 1
            ? "Approved"
            : "Rejected",
        reason: l.Reason,
        isHalfDay: l.IsHalfDay,
      }));

      setLeaves(mapped);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load leave requests.");
    } finally {
      setLoading(false);
    }
  };

  const updateLeaveStatus = async (
    leaveID: number,
    statusID: number,
    rejectReason: string = ""
  ) => {
    try {
      setActionLoading(leaveID);

      const payload = {
        organizationID,
        employeeLeaveID: leaveID,
        leaveStatusID: statusID,
        approvedBy: employeeID,
        rejectReason,
      };

      await leaveService.ApproveOrRejectEmployeeLeaveAsync(payload);

      setLeaves((prev) => prev.filter((l) => l.id !== leaveID));

      const oldLeave = leaves.find((l) => l.id === leaveID);

      const newLeave = oldLeave
        ? {
            ...oldLeave,
            status: statusID === 1 ? "Approved" : "Rejected",
          }
        : null;

      fireAudit(
        "UPDATE",
        "Leave",
        oldLeave,
        newLeave,
        organizationID || 0,
        user?.name || user?.username || "Admin",
        "ApproveLeavesTab"
      );
    } catch (err: any) {
      alert(err?.message || "Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = (leaveID: number) => {
    updateLeaveStatus(leaveID, 1);
  };

  const handleOpenRejectModal = (leaveID: number) => {
    setSelectedLeaveID(leaveID);
    setRejectComment("");
    setShowModal(true);
  };

  const handleSubmitReject = () => {
    if (!rejectComment.trim()) {
      alert("Please enter rejection reason");
      return;
    }

    if (selectedLeaveID !== null) {
      updateLeaveStatus(selectedLeaveID, 2, rejectComment);
    }

    setShowModal(false);
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: 200 }}
      >
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  const pending = leaves.filter((l) => l.status === "Pending");

  if (!pending.length) {
    return (
      <Alert variant="info">
        No pending leave requests from your team.
      </Alert>
    );
  }

  return (
    <>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="table-responsive">
            <Table className="table table-hover table-dark-custom">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {pending.map((l) => (
                  <tr key={l.id}>
                    <td>{l.employeeName}</td>

                    <td>{l.leaveTypeName}</td>

                    <td>
                      {formatDate(l.startDate)}
                      {l.startDate && l.endDate ? " → " : ""}
                      {formatDate(l.endDate)}

                      {l.isHalfDay && (
                        <span className="text-muted ms-2">
                          (Half Day)
                        </span>
                      )}
                    </td>

                    <td>{l.numberOfDays}</td>

                    <td>{l.reason}</td>

                    <td>
                      <Badge bg="warning" text="dark">
                        Pending
                      </Badge>
                    </td>

                    <td>
                      <Button
                        size="sm"
                        variant="success"
                        className="me-2"
                        disabled={actionLoading === l.id}
                        onClick={() => handleApprove(l.id)}
                      >
                        {actionLoading === l.id
                          ? "Processing..."
                          : "Approve"}
                      </Button>

                      <Button
                        size="sm"
                        variant="danger"
                        disabled={actionLoading === l.id}
                        onClick={() => handleOpenRejectModal(l.id)}
                      >
                        Reject
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reject Leave</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form.Group>
            <Form.Label>Rejection Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Enter reason for rejection..."
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleSubmitReject}
          >
            Submit Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveLeaves;