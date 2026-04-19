import React, { useState } from "react";
import { Button, Table, Modal, Form, Row, Col, Badge } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ================= TYPES =================
interface Approval {
  ApprovalID: number;
  JobRequisitionNo: string;
  JobTitle: string;
  ApproverName: string;
  ApprovalOrder: number;
  Status: "Pending" | "Approved" | "Rejected";
  Comments: string;
  ActionDate?: string;
}

// ================= STATIC DATA =================
const initialData: Approval[] = [
  {
    ApprovalID: 1,
    JobRequisitionNo: "JR-001",
    JobTitle: "React Developer",
    ApproverName: "Manager A",
    ApprovalOrder: 1,
    Status: "Pending",
    Comments: "",
  },
  {
    ApprovalID: 2,
    JobRequisitionNo: "JR-002",
    JobTitle: "Backend Developer",
    ApproverName: "Manager B",
    ApprovalOrder: 2,
    Status: "Approved",
    Comments: "Looks good",
    ActionDate: "2026-04-18",
  },
  {
    ApprovalID: 3,
    JobRequisitionNo: "JR-003",
    JobTitle: "QA Engineer",
    ApproverName: "Manager C",
    ApprovalOrder: 1,
    Status: "Rejected",
    Comments: "Not suitable",
    ActionDate: "2026-04-17",
  },
];

const statusOptions = ["Pending", "Approved", "Rejected"];

// ================= COMPONENT =================
const ManageJobRequisitionApprovals: React.FC = () => {
  const [approvals, setApprovals] = useState<Approval[]>(initialData);

  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Approval | null>(null);

  const [formData, setFormData] = useState({
    Status: "Approved",
    Comments: "",
  });

  // ================= OPEN MODAL =================
  const openModal = (item: Approval) => {
    setSelected(item);
    setFormData({
      Status: "Approved",
      Comments: "",
    });
    setShowModal(true);
  };

  // ================= HANDLE SAVE =================
  const handleSave = () => {
    if (!selected) return;

    const updated = approvals.map((a) =>
      a.ApprovalID === selected.ApprovalID
        ? {
            ...a,
            Status: formData.Status as any,
            Comments: formData.Comments,
            ActionDate: new Date().toISOString().slice(0, 10),
          }
        : a
    );

    setApprovals(updated);
    setShowModal(false);

    toast.success(`Request ${formData.Status}`);
  };

  // ================= UI =================
  return (
    <div className="container mt-3">
      <h3>Manage Job Requisition Approvals (Static UI)</h3>

      {/* ================= TABLE ================= */}
      <Table bordered hover className="mt-3">
        <thead>
          <tr>
            <th>Req No</th>
            <th>Job Title</th>
            <th>Approver</th>
            <th>Order</th>
            <th>Status</th>
            <th>Comments</th>
            <th>Action Date</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {approvals.map((item) => (
            <tr key={item.ApprovalID}>
              <td>{item.JobRequisitionNo}</td>
              <td>{item.JobTitle}</td>
              <td>{item.ApproverName}</td>
              <td>{item.ApprovalOrder}</td>

              <td>
                {item.Status === "Approved" && (
                  <Badge bg="success">Approved</Badge>
                )}
                {item.Status === "Rejected" && (
                  <Badge bg="danger">Rejected</Badge>
                )}
                {item.Status === "Pending" && (
                  <Badge bg="warning">Pending</Badge>
                )}
              </td>

              <td>{item.Comments || "-"}</td>
              <td>{item.ActionDate || "-"}</td>

              <td>
                {item.Status === "Pending" ? (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => openModal(item)}
                  >
                    Take Action
                  </Button>
                ) : (
                  <span className="text-muted">Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* ================= MODAL ================= */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Approval Action</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            {/* STATUS */}
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={formData.Status}
                onChange={(e) =>
                  setFormData({ ...formData, Status: e.target.value })
                }
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* COMMENTS */}
            <Form.Group>
              <Form.Label>Comments</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter comments..."
                value={formData.Comments}
                onChange={(e) =>
                  setFormData({ ...formData, Comments: e.target.value })
                }
              />
            </Form.Group>
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSave}>
            Submit
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ManageJobRequisitionApprovals;