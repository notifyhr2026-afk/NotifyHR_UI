import React, { useEffect, useState } from "react";
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsPlus } from "react-icons/bs";
import leaveTypesService from "../../services/leaveTypesService";

// Helper for react-icons
const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface LeaveType {
  LeaveTypeID: number;
  LeaveTypeName: string;
  Description: string;
  isActive: boolean;
}

const ManageLeaveTypes: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [leaveFormData, setLeaveFormData] = useState<LeaveType>({
    LeaveTypeID: 0,
    LeaveTypeName: "",
    Description: "",
    isActive: true,
  });

  const [editLeave, setEditLeave] = useState<LeaveType | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

  // ============================
  // Fetch Leave Types
  // ============================
  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await leaveTypesService.getLeaveLeaveTypes();

      // Map backend response → frontend model
      const mappedData: LeaveType[] = data.map((item: any) => ({
        LeaveTypeID: item.LeaveTypeID,
        LeaveTypeName: item.LeaveTypeName,
        Description: item.Description,
        isActive: item.isActive ?? true, // default if backend doesn't send it
      }));

      setLeaveTypes(mappedData);
    } catch (err) {
      setError("Failed to load leave types.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // Handlers
  // ============================
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value, type } = e.target;

    if (type === "checkbox") {
      setLeaveFormData((prev) => ({
        ...prev,
        [id]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setLeaveFormData((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  const openAddModal = () => {
    setEditLeave(null);
    setLeaveFormData({
      LeaveTypeID: 0,
      LeaveTypeName: "",
      Description: "",
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (leave: LeaveType) => {
    setEditLeave(leave);
    setLeaveFormData(leave);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!leaveFormData.LeaveTypeName || !leaveFormData.Description) {
      alert("Please fill all required fields.");
      return;
    }

    if (editLeave) {
      // Local update (replace with PUT API later)
      setLeaveTypes((prev) =>
        prev.map((l) =>
          l.LeaveTypeID === leaveFormData.LeaveTypeID ? leaveFormData : l
        )
      );
    } else {
      // Local add (replace with POST API later)
      setLeaveTypes((prev) => [
        ...prev,
        { ...leaveFormData, LeaveTypeID: Date.now() },
      ]);
    }

    setShowModal(false);
  };

  const confirmDeleteLeave = (id: number) => {
    setLeaveToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (leaveToDelete !== null) {
      // Local delete (replace with DELETE API later)
      setLeaveTypes((prev) =>
        prev.filter((l) => l.LeaveTypeID !== leaveToDelete)
      );
      setLeaveToDelete(null);
      setConfirmDelete(false);
    }
  };

  // ============================
  // Render
  // ============================
  return (
    <div className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Manage Leave Types</h3>
        <Button variant="primary" onClick={openAddModal}>
          {Icon(BsPlus, { className: "me-1" })} Add Leave Type
        </Button>
      </div>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && leaveTypes.length > 0 ? (
        <Table bordered hover responsive className="shadow-sm">
          <thead className="table-light">
            <tr>
              <th>Leave Type</th>
              <th>Description</th>
              <th>Active</th>
              <th style={{ width: "140px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveTypes.map((l) => (
              <tr key={l.LeaveTypeID}>
                <td>{l.LeaveTypeName}</td>
                <td>{l.Description}</td>
                <td>
                  {l.isActive ? (
                    <Badge bg="success">Active</Badge>
                  ) : (
                    <Badge bg="danger">Inactive</Badge>
                  )}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() => openEditModal(l)}
                  >
                    {Icon(BsPencilSquare, { size: 16 })}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => confirmDeleteLeave(l.LeaveTypeID)}
                  >
                    {Icon(BsTrash, { size: 16 })}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        !loading && <p className="text-muted">No leave types added yet.</p>
      )}

      {/* Add / Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editLeave ? "Edit Leave Type" : "Add New Leave Type"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Leave Type Name <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  id="LeaveTypeName"
                  type="text"
                  value={leaveFormData.LeaveTypeName}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>
                  Description <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  id="Description"
                  value={leaveFormData.Description}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Check
                  type="switch"
                  id="isActive"
                  label="Active Leave Type"
                  checked={leaveFormData.isActive}
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
            {editLeave ? "Update Leave Type" : "Save Leave Type"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Leave Type?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          This action cannot be undone. Do you want to delete this leave type?
        </Modal.Body>
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

export default ManageLeaveTypes;
