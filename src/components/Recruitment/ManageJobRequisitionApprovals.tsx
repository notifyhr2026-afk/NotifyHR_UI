import React, { useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ======= Types =======
interface Approval {
  ApprovalID: number;
  JobRequisitionID: number;
  ApproverID: number;
  ApprovalOrder: number;
  Status: string;
  Comments: string;
  ActionDate?: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

// ======= Static Data =======
const jobRequisitions: DropdownItem[] = [
  { id: 1, name: "JR-001" },
  { id: 2, name: "JR-002" },
];

const approvers: DropdownItem[] = [
  { id: 201, name: "Manager A" },
  { id: 202, name: "Manager B" },
  { id: 203, name: "Manager C" },
];

const statuses: DropdownItem[] = [
  { id: 1, name: "Pending" },
  { id: 2, name: "Approved" },
  { id: 3, name: "Rejected" },
];

// ======= Component =======
const ManageJobRequisitionApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>([
    {
      ApprovalID: 1,
      JobRequisitionID: 1,
      ApproverID: 201,
      ApprovalOrder: 1,
      Status: "Pending",
      Comments: "Initial approval",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editApproval, setEditApproval] = useState<Approval | null>(null);
  const [formData, setFormData] = useState<Approval>({
    ApprovalID: 0,
    JobRequisitionID: 0,
    ApproverID: 0,
    ApprovalOrder: 1,
    Status: "Pending",
    Comments: "",
    ActionDate: "",
  });

  const [validated, setValidated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [approvalToDelete, setApprovalToDelete] = useState<number | null>(null);

  // ======= Handlers =======
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]:
        type === "number"
          ? parseInt(value)
          : value,
    }));
  };

  const openAddModal = () => {
    setEditApproval(null);
    setFormData({
      ApprovalID: 0,
      JobRequisitionID: 0,
      ApproverID: 0,
      ApprovalOrder: 1,
      Status: "Pending",
      Comments: "",
      ActionDate: "",
    });
    setShowModal(true);
  };

  const openEditModal = (approval: Approval) => {
    setEditApproval(approval);
    setFormData(approval);
    setShowModal(true);
  };

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      toast.warn("Please fill all required fields correctly.");
      return;
    }

    if (editApproval) {
      setApprovals((prev) =>
        prev.map((a) =>
          a.ApprovalID === formData.ApprovalID ? formData : a
        )
      );
      toast.success("Approval updated successfully!");
    } else {
      const newID = approvals.length
        ? Math.max(...approvals.map((a) => a.ApprovalID)) + 1
        : 1;
      setApprovals((prev) => [...prev, { ...formData, ApprovalID: newID }]);
      toast.success("Approval added successfully!");
    }

    setShowModal(false);
    setValidated(false);
  };

  const confirmDeleteApproval = (id: number) => {
    setApprovalToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (approvalToDelete !== null) {
      setApprovals((prev) =>
        prev.filter((a) => a.ApprovalID !== approvalToDelete)
      );
      toast.success("Approval deleted successfully!");
      setConfirmDelete(false);
    }
  };

  // ======= Render =======
  return (
    <div className="mt-5">
      <h3>Manage Job Requisition Approvals</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Approval
        </Button>
      </div>

      {/* Table */}
      <Table striped bordered hover responsive className="shadow-sm table-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Job Requisition</th>
            <th>Approver</th>
            <th>Order</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Action Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {approvals.map((a) => (
            <tr key={a.ApprovalID}>
              <td>{a.ApprovalID}</td>
              <td>{jobRequisitions.find((j) => j.id === a.JobRequisitionID)?.name}</td>
              <td>{approvers.find((u) => u.id === a.ApproverID)?.name}</td>
              <td>{a.ApprovalOrder}</td>
              <td>
                <span
                  className={`badge ${
                    a.Status === "Approved"
                      ? "bg-success"
                      : a.Status === "Rejected"
                      ? "bg-danger"
                      : "bg-primary"
                  }`}
                >
                  {a.Status}
                </span>
              </td>
              <td>{a.Comments}</td>
              <td>{a.ActionDate || "-"}</td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="me-2"
                  onClick={() => openEditModal(a)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => confirmDeleteApproval(a.ApprovalID)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editApproval ? "Edit Approval" : "Add Approval"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSave}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="JobRequisitionID">
                  <Form.Label>Job Requisition</Form.Label>
                  <Form.Select
                    required
                    value={formData.JobRequisitionID}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Requisition</option>
                    {jobRequisitions.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="ApproverID">
                  <Form.Label>Approver</Form.Label>
                  <Form.Select
                    required
                    value={formData.ApproverID}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Approver</option>
                    {approvers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group controlId="ApprovalOrder">
                  <Form.Label>Approval Order</Form.Label>
                  <Form.Control
                    required
                    type="number"
                    value={formData.ApprovalOrder}
                    onChange={handleInputChange}
                    min={1}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="Status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    required
                    value={formData.Status}
                    onChange={handleInputChange}
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="ActionDate">
                  <Form.Label>Action Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.ActionDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="Comments" className="mb-3">
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                value={formData.Comments}
                onChange={handleInputChange}
                rows={2}
              />
            </Form.Group>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editApproval ? "Update" : "Save"}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to delete this approval?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageJobRequisitionApprovals;
