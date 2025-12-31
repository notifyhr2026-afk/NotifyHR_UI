import React, { useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
} from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsPlus } from "react-icons/bs";

// Helper to safely render react-icons in strict TS projects
const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface Holiday {
  id: number;
  branchID: string;
  holidayName: string;
  holidayDate: string;
  isOptional: boolean;
  isActive: boolean;
}

const ManageHolidays: React.FC = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [holidayFormData, setHolidayFormData] = useState<Holiday>({
    id: 0,
    branchID: "",
    holidayName: "",
    holidayDate: "",
    isOptional: false,
    isActive: true,
  });

  const [editHoliday, setEditHoliday] = useState<Holiday | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<number | null>(null);

  // Mock branches for dropdown
  const branches = [
    { id: "1", name: "Head Office" },
    { id: "2", name: "Branch A" },
    { id: "3", name: "Branch B" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value, type } = e.target;

    if (type === "checkbox") {
      setHolidayFormData((prev) => ({
        ...prev,
        [id]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setHolidayFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const openAddModal = () => {
    setEditHoliday(null);
    setHolidayFormData({
      id: 0,
      branchID: "",
      holidayName: "",
      holidayDate: "",
      isOptional: false,
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (holiday: Holiday) => {
    setEditHoliday(holiday);
    setHolidayFormData(holiday);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!holidayFormData.branchID || !holidayFormData.holidayName || !holidayFormData.holidayDate) {
      alert("Please fill all required fields.");
      return;
    }

    if (editHoliday) {
      setHolidays((prev) =>
        prev.map((h) => (h.id === holidayFormData.id ? holidayFormData : h))
      );
    } else {
      setHolidays((prev) => [
        ...prev,
        { ...holidayFormData, id: Date.now() },
      ]);
    }
    setShowModal(false);
  };

  const confirmDeleteHoliday = (id: number) => {
    setHolidayToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (holidayToDelete !== null) {
      setHolidays((prev) => prev.filter((h) => h.id !== holidayToDelete));
      setHolidayToDelete(null);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Manage Holidays</h3>
        <Button variant="primary" onClick={openAddModal}>
          {Icon(BsPlus, { className: "me-1" })}
          Add Holiday
        </Button>
      </div>

      {/* Holiday Table */}
      {holidays.length > 0 ? (
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Branch</th>
              <th>Holiday</th>
              <th>Date</th>
              <th>Optional</th>
              <th>Active</th>
              <th style={{ width: "140px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {holidays.map((h) => (
              <tr key={h.id}>
                <td>{branches.find((b) => b.id === h.branchID)?.name}</td>
                <td>{h.holidayName}</td>
                <td>
                  <Badge bg="secondary">{h.holidayDate}</Badge>
                </td>
                <td>
                  {h.isOptional ? <Badge bg="info">Yes</Badge> : <Badge bg="dark">No</Badge>}
                </td>
                <td>
                  {h.isActive ? <Badge bg="success">Active</Badge> : <Badge bg="danger">Inactive</Badge>}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => openEditModal(h)}
                    className="me-2"
                  >
                    {Icon(BsPencilSquare, { size: 16 })}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteHoliday(h.id)}
                  >
                    {Icon(BsTrash, { size: 16 })}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">No holidays added yet.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editHoliday ? "Edit Holiday" : "Add New Holiday"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Branch <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  id="branchID"
                  value={holidayFormData.branchID}
                  onChange={handleInputChange}
                >
                  <option value="">-- Select Branch --</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>

            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Holiday Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  id="holidayName"
                  type="text"
                  placeholder="Ex: New Year's Day"
                  value={holidayFormData.holidayName}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>
                  Holiday Date <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  id="holidayDate"
                  type="date"
                  value={holidayFormData.holidayDate}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row className="mt-2">
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="isOptional"
                  label="Optional Holiday"
                  checked={holidayFormData.isOptional}
                  onChange={handleInputChange}
                />
              </Col>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="isActive"
                  label="Active Holiday"
                  checked={holidayFormData.isActive}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {editHoliday ? "Update Holiday" : "Save Holiday"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Holiday?</Modal.Title>
        </Modal.Header>
        <Modal.Body>This action cannot be undone. Do you want to delete this holiday?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ManageHolidays;
