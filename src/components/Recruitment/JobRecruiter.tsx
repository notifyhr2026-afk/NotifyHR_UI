import React, { useState } from "react";
import { Button, Table, Modal, Form, Row, Col } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// ======= Types =======
interface JobRecruiter {
  JobReqRecruiterID: number;
  JobRequisitionID: number;
  RecruiterUserID: number;
  AssignedDate: string;
  RevokedDate?: string;
  Status: string;
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

const recruiters: DropdownItem[] = [
  { id: 101, name: "Alice" },
  { id: 102, name: "Bob" },
  { id: 103, name: "Charlie" },
];

const statuses: DropdownItem[] = [
  { id: 1, name: "Active" },
  { id: 2, name: "Revoked" },
];

// ======= Component =======
const ManageJobRequisitionRecruiters: React.FC = () => {
  const [recruitersList, setRecruitersList] = useState<JobRecruiter[]>([
    {
      JobReqRecruiterID: 1,
      JobRequisitionID: 1,
      RecruiterUserID: 101,
      AssignedDate: "2025-12-20",
      Status: "Active",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editRecruiter, setEditRecruiter] = useState<JobRecruiter | null>(null);
  const [formData, setFormData] = useState<JobRecruiter>({
    JobReqRecruiterID: 0,
    JobRequisitionID: 0,
    RecruiterUserID: 0,
    AssignedDate: new Date().toISOString().slice(0, 10),
    RevokedDate: "",
    Status: "Active",
  });

  const [validated, setValidated] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [recruiterToDelete, setRecruiterToDelete] = useState<number | null>(null);

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

  const openAddModal = () => {
    setEditRecruiter(null);
    setFormData({
      JobReqRecruiterID: 0,
      JobRequisitionID: 0,
      RecruiterUserID: 0,
      AssignedDate: new Date().toISOString().slice(0, 10),
      RevokedDate: "",
      Status: "Active",
    });
    setShowModal(true);
  };

  const openEditModal = (rec: JobRecruiter) => {
    setEditRecruiter(rec);
    setFormData(rec);
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

    if (editRecruiter) {
      setRecruitersList((prev) =>
        prev.map((r) => (r.JobReqRecruiterID === formData.JobReqRecruiterID ? formData : r))
      );
      toast.success("Recruiter updated successfully!");
    } else {
      const newID = recruitersList.length
        ? Math.max(...recruitersList.map((r) => r.JobReqRecruiterID)) + 1
        : 1;
      setRecruitersList((prev) => [...prev, { ...formData, JobReqRecruiterID: newID }]);
      toast.success("Recruiter added successfully!");
    }

    setShowModal(false);
    setValidated(false);
  };

  const confirmDeleteRecruiter = (id: number) => {
    setRecruiterToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (recruiterToDelete !== null) {
      setRecruitersList((prev) =>
        prev.filter((r) => r.JobReqRecruiterID !== recruiterToDelete)
      );
      toast.success("Recruiter deleted successfully!");
      setConfirmDelete(false);
    }
  };

  // ======= Render =======
  return (
    <div className="mt-5">
      <h3>Manage Job Requisition Recruiters</h3>
      <div className="text-end mb-3">
        <Button variant="success" onClick={openAddModal}>
          + Add Recruiter
        </Button>
      </div>

      {/* Table */}
      <Table striped bordered hover responsive className="shadow-sm table-sm">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Job Requisition</th>
            <th>Recruiter</th>
            <th>Assigned Date</th>
            <th>Revoked Date</th>
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
              <td>{r.RevokedDate || "-"}</td>
              <td>
                <span
                  className={`badge ${
                    r.Status === "Active" ? "bg-primary" : "bg-danger"
                  }`}
                >
                  {r.Status}
                </span>
              </td>
              <td>
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => openEditModal(r)}
                  className="me-2"
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => confirmDeleteRecruiter(r.JobReqRecruiterID)}
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
          <Modal.Title>{editRecruiter ? "Edit Recruiter" : "Add Recruiter"}</Modal.Title>
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
                <Form.Group controlId="RecruiterUserID">
                  <Form.Label>Recruiter</Form.Label>
                  <Form.Select
                    required
                    value={formData.RecruiterUserID}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Recruiter</option>
                    {recruiters.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="AssignedDate">
                  <Form.Label>Assigned Date</Form.Label>
                  <Form.Control
                    required
                    type="date"
                    value={formData.AssignedDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="RevokedDate">
                  <Form.Label>Revoked Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={formData.RevokedDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
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
            </Row>

            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {editRecruiter ? "Update" : "Save"}
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
        <Modal.Body>Are you sure you want to delete this recruiter assignment?</Modal.Body>
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

export default ManageJobRequisitionRecruiters;
