import React, { useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ======= Types =======
interface JobRequisition {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  RecruiterUserID: number;
  AssignedDate: string;
  Status: string;
  Comment?: string;
}

interface DropdownItem {
  id: number;
  name: string;
}

const jobRequisitions: DropdownItem[] = [
  { id: 1, name: "JR-001" },
  { id: 2, name: "JR-002" },
];

const recruiters: DropdownItem[] = [
  { id: 101, name: "Alice" },
  { id: 102, name: "Bob" },
  { id: 103, name: "Charlie" },
];

const statuses: DropdownItem[] = [
  { id: 1, name: "Approved" },
  { id: 2, name: "Rejected" },
];

// ======= Component =======
const RecruiterApprovalPage: React.FC = () => {
  const [recruitersList, setRecruitersList] = useState<JobRequisition[]>([
    {
      JobReqRecruiterID: 1,
      JobRequisitionID: 1,
      RecruiterUserID: 101,
      AssignedDate: "2025-12-20",
      Status: "Pending",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [editRequisition, setEditRequisition] = useState<JobRequisition | null>(null);
  const [formData, setFormData] = useState<JobRequisition>({
    JobReqRecruiterID: 0,
    JobRequisitionID: 0,
    RecruiterUserID: 0,
    AssignedDate: new Date().toISOString().slice(0, 10),
    Status: "Pending",
  });

  const [validated, setValidated] = useState(false);

  // ======= Handlers =======
  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === "JobRequisitionID" || id === "RecruiterUserID" ? parseInt(value) : value,
    }));
  };

  const openApprovalModal = (req: JobRequisition) => {
    setEditRequisition(req);
    setFormData(req);
    setShowModal(true);
  };

  const handleApprovalChange = (status: string) => {
    setFormData((prev) => ({
      ...prev,
      Status: status,
    }));
  };

  const handleSaveApproval = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      toast.warn("Please fill all required fields correctly.");
      return;
    }

    // Update the recruiters list
    setRecruitersList((prev) =>
      prev.map((r) =>
        r.JobReqRecruiterID === formData.JobReqRecruiterID
          ? { ...r, Status: formData.Status, Comment: formData.Comment }
          : r
      )
    );
    toast.success(`Requisition ${formData.Status} successfully!`);

    setShowModal(false);
    setValidated(false);
  };

  // ======= Render =======
  return (
    <div className="mt-5">
      <h3>Recruiter Approval Page</h3>

      {/* Table */}
      <Table striped bordered hover responsive className="shadow-sm table-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Job Requisition</th>
            <th>Recruiter</th>
            <th>Assigned Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {recruitersList.map((r) => (
            <tr key={r.JobReqRecruiterID}>
              <td>{r.JobReqRecruiterID}</td>
              <td>{jobRequisitions.find((j) => j.id === r.JobRequisitionID)?.name}</td>
              <td>{recruiters.find((u) => u.id === r.RecruiterUserID)?.name}</td>
              <td>{r.AssignedDate}</td>
              <td>
                <span
                  className={`badge ${
                    r.Status === "Approved" ? "bg-success" : r.Status === "Rejected" ? "bg-danger" : "bg-warning"
                  }`}
                >
                  {r.Status}
                </span>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => openApprovalModal(r)}
                >
                  Approve/Reject
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Approval/Reject Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editRequisition ? "Approve/Reject Requisition" : "Requisition Status"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleSaveApproval}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="JobRequisitionID">
                  <Form.Label>Job Requisition</Form.Label>
                  <Form.Control
                    value={jobRequisitions.find((j) => j.id === formData.JobRequisitionID)?.name}
                    disabled
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="RecruiterUserID">
                  <Form.Label>Recruiter</Form.Label>
                  <Form.Control
                    value={recruiters.find((r) => r.id === formData.RecruiterUserID)?.name}
                    disabled
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="Status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={formData.Status}
                    onChange={(e) => handleApprovalChange(e.target.value)}
                    required
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approve</option>
                    <option value="Rejected">Reject</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group controlId="Comment">
                  <Form.Label>Comment</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={formData.Comment || ""}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save
              </Button>
            </Modal.Footer>
          </Form>
        </Modal.Body>
      </Modal>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default RecruiterApprovalPage;
