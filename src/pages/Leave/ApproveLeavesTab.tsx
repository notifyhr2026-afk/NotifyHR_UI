// src/pages/Leave/ApproveLeavesTab.tsx
import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Spinner,
  Alert,
  Card,
  Badge,
  Modal,
  Form
} from 'react-bootstrap';
import employeeService from '../../services/employeeService';
import leaveService from '../../services/leaveService';

// -------------------- Types --------------------
type EmployeeOption = {
  value: number;
  label: string;
};

type Leave = {
  id: number;
  employeeID: number;
  leaveTypeID: number;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  numberOfDays: number;
  status: string;
  reason: string;
  isHalfDay: boolean;
};

type ReportedEmployee = {
  EmployeeID: number;
  EmployeeName: string;
};

type LeaveAPI = {
  EmployeeLeaveID: number;
  EmployeeID: number;
  LeaveTypeID: number;
  LeaveTypeName: string;
  StartDate: string;
  EndDate: string;
  NumberOfDays: number;
  LeaveStatusID: number;
  Reason: string;
  IsHalfDay: boolean;
};

// -------------------- Component --------------------
const ApproveLeavesTab: React.FC = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // 🔹 Reject Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedLeaveID, setSelectedLeaveID] = useState<number | null>(null);
  const [rejectComment, setRejectComment] = useState('');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const employeeID: number | undefined = user?.employeeID;

  // -------------------- Fetch Data --------------------
  useEffect(() => {
    if (!employeeID) {
      setError('User information not found.');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const reportedEmployees: ReportedEmployee[] =
          await employeeService.GetReportedEmployeesAsync(employeeID);

        const employeeIDs = reportedEmployees.map((e) => e.EmployeeID);

        setEmployees(
          reportedEmployees.map((e) => ({
            value: e.EmployeeID,
            label: e.EmployeeName,
          }))
        );

        const leavesData: LeaveAPI[] =
          await leaveService.GetEmployeeLeavesForApproveByAsync(employeeIDs);

        setLeaves(
          leavesData.map((l) => ({
            id: l.EmployeeLeaveID,
            employeeID: l.EmployeeID,
            leaveTypeID: l.LeaveTypeID,
            leaveTypeName: l.LeaveTypeName,
            startDate: l.StartDate,
            endDate: l.EndDate,
            numberOfDays: l.NumberOfDays,
            status:
              l.LeaveStatusID === 0
                ? 'Pending'
                : l.LeaveStatusID === 1
                ? 'Approved'
                : 'Rejected',
            reason: l.Reason,
            isHalfDay: l.IsHalfDay,
          }))
        );
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to load leave requests.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeID]);

  // -------------------- API Call --------------------
  const updateLeaveStatus = async (
    leaveID: number,
    statusID: number,
    rejectReason: string = ''
  ) => {
    try {
      setActionLoading(leaveID);

      const payload = {
        employeeLeaveID: leaveID,
        leaveStatusID: statusID,
        approvedBy: employeeID,
        rejectReason: rejectReason || ''
      };

      await leaveService.ApproveOrRejectEmployeeLeaveAsync(payload);

      // 🔥 Remove from UI after action
      setLeaves((prev) => prev.filter((l) => l.id !== leaveID));
    } catch (err: any) {
      alert(err?.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  // -------------------- Handlers --------------------
  const handleApprove = (leaveID: number) => {
    updateLeaveStatus(leaveID, 1);
  };

  const handleOpenRejectModal = (leaveID: number) => {
    setSelectedLeaveID(leaveID);
    setRejectComment('');
    setShowModal(true);
  };

  const handleSubmitReject = () => {
    if (!rejectComment.trim()) {
      alert('Please enter rejection reason');
      return;
    }

    if (selectedLeaveID !== null) {
      updateLeaveStatus(selectedLeaveID, 2, rejectComment);
    }

    setShowModal(false);
  };

  // -------------------- UI States --------------------
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;

  const pending = leaves.filter((l) => l.status === 'Pending');

  if (!pending.length) {
    return <Alert variant="info">No pending leave requests from your team.</Alert>;
  }

  // -------------------- UI --------------------
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
                    <td>
                      {employees.find((e) => e.value === l.employeeID)?.label || 'N/A'}
                    </td>

                    <td>{l.leaveTypeName}</td>

                    <td>
                      {l.startDate} → {l.endDate}{' '}
                      {l.isHalfDay && <Badge bg="info">Half Day</Badge>}
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
                        {actionLoading === l.id ? 'Processing...' : 'Approve'}
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

      {/* 🔴 Reject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleSubmitReject}>
            Submit Reject
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveLeavesTab;