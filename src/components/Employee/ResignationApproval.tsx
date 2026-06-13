import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Modal, Row, Col, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';

interface ExitRequest {
  ExitID: number;
  EmployeeID: number;
  ExitReasonID: number;
  LastWorkingDay: string;
  ExitInterviewNotes: string;
  ApprovedBy: number | null;
  ApprovedAt: string | null;
  AssetClearanceStatus: string;
}

const AdminResignationApproval: React.FC = () => {
  const [requests, setRequests] = useState<ExitRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<ExitRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);

  const [form, setForm] = useState({
    approverComments: '',
    lastWorkingDay: '',
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const payload = {
        organizationID: user?.organizationID || 0,
        employeeIDs: null,
      };

      const res = await employeeService.GetResignationRequestsAsync(payload);

      // 🔥 IMPORTANT: API returns ARRAY directly (NOT .Table)
      setRequests(res || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load resignation requests');
    } finally {
      setLoading(false);
    }
  };

  // ---------------- MODAL ----------------
  const openActionModal = (
    item: ExitRequest,
    type: 'approve' | 'reject'
  ) => {
    setSelected(item);
    setActionType(type);

    setForm({
      approverComments: '',
      lastWorkingDay: item.LastWorkingDay?.split('T')[0] || '',
    });

    setShowModal(true);
  };

  const handleChange = (e: React.ChangeEvent<any>) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  // ---------------- APPROVE / REJECT ----------------
  const handleSubmit = async () => {
    if (!selected || !actionType) return;

    try {
      const payload = {
        employeeID: selected.EmployeeID,
        organizationID: user?.organizationID || 0,
        statusID: actionType === 'approve' ? 1 : 2,
        approvedBy: user?.userID || 0,
        approverComments: form.approverComments,
        lastWorkingDay: form.lastWorkingDay,
      };

      await employeeService.ApproveorRejectResignation(payload);

      toast.success(
        actionType === 'approve'
          ? 'Approved Successfully'
          : 'Rejected Successfully'
      );

      setShowModal(false);
      fetchRequests();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  // ---------------- STATUS ----------------
  const getStatus = (item: ExitRequest) => {
    if (item.ApprovedAt) return <span className="badge bg-success">Approved</span>;
    if (item.ApprovedBy === null && item.AssetClearanceStatus === 'Rejected')
      return <span className="badge bg-danger">Rejected</span>;
    return <span className="badge bg-warning">Pending</span>;
  };

  return (
    <div>
      <h4 className="mb-3">Resignation Requests</h4>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>Employee ID</th>
              <th>Reason</th>
              <th>Last Working Day</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {requests.map((item) => (
              <tr key={item.ExitID}>
                <td>{item.EmployeeID}</td>
                <td>{item.ExitReasonID}</td>
                <td>{item.LastWorkingDay?.split('T')[0]}</td>
                <td>{getStatus(item)}</td>

                <td>
                  <Button
                    size="sm"
                    variant="success"
                    className="me-2"
                    onClick={() => openActionModal(item, 'approve')}
                  >
                    Approve
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => openActionModal(item, 'reject')}
                  >
                    Reject
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* ---------------- MODAL ---------------- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === 'approve' ? 'Approve' : 'Reject'} Resignation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="info">
            Employee ID: <b>{selected?.EmployeeID}</b>
          </Alert>

          <Row className="mb-3">
            <Col>
              <Form.Group controlId="lastWorkingDay">
                <Form.Label>Last Working Day</Form.Label>
                <Form.Control
                  type="date"
                  value={form.lastWorkingDay}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group controlId="approverComments">
            <Form.Label>Comments</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={form.approverComments}
              onChange={handleChange}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button
            variant={actionType === 'approve' ? 'success' : 'danger'}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminResignationApproval;