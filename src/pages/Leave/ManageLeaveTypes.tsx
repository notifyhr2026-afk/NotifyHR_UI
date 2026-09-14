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
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { BsPencilSquare, BsTrash, BsPlus } from "react-icons/bs";
import leaveTypesService from "../../services/leaveTypesService";

const Icon = (Component: any, props: any = {}) => <Component {...props} />;

interface LeaveType {
  LeaveTypeID: number;
  LeaveTypeName: string;
  Description: string;
  Gender: string;
  isActive: boolean;
}

const ManageLeaveTypes: React.FC = () => {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [validated, setValidated] = useState(false);

  const [leaveFormData, setLeaveFormData] = useState<LeaveType>({
    LeaveTypeID: 0,
    LeaveTypeName: "",
    Description: "",
    Gender: "all",
    isActive: true,
  });

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<number | null>(null);

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    message: "",
    bg: "success",
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  // ============================
  // FETCH LEAVE TYPES
  // ============================
  const fetchLeaveTypes = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await leaveTypesService.getLeaveLeaveTypes();

      const mappedData: LeaveType[] = data.map((item: any) => ({
        LeaveTypeID: item.LeaveTypeID,
        LeaveTypeName: item.LeaveTypeName,
        Description: item.Description,
        Gender: item.Gender ?? item.gender ?? "all",
        isActive: item.isActive ?? true,
      }));

      setLeaveTypes(mappedData);
    } catch {
      setError("Failed to load leave types.");
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // INPUT CHANGE
  // ============================
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
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

  // ============================
  // ADD MODAL
  // ============================
  const openAddModal = () => {
    setLeaveFormData({
      LeaveTypeID: 0,
      LeaveTypeName: "",
      Description: "",
      Gender: "all",
      isActive: true,
    });

    setValidated(false);
    setShowModal(true);
  };

  // ============================
  // EDIT MODAL
  // ============================
  const openEditModal = (leave: LeaveType) => {
    setLeaveFormData({
      ...leave,
      Gender: leave.Gender ?? "all",
    });

    setValidated(false);
    setShowModal(true);
  };

  // ============================
  // SAVE
  // ============================
  const handleSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const form = event.currentTarget;

    if (form.checkValidity() === false) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setLoading(true);

      const payload = {
        leaveTypeID: leaveFormData.LeaveTypeID,
        leaveTypeName: leaveFormData.LeaveTypeName,
        description: leaveFormData.Description,
        GenderType: leaveFormData.Gender,
      };

      const response =
        await leaveTypesService.PostLeaveTypeByAsync(payload);

      if (response.value === 1) {
        setToast({
          show: true,
          message: response.message,
          bg: "success",
        });

        await fetchLeaveTypes();
        setShowModal(false);
      } else if (response.value === 0) {
        setToast({
          show: true,
          message: response.message,
          bg: "warning",
        });
      }
    } catch {
      setToast({
        show: true,
        message: "Something went wrong.",
        bg: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DELETE CONFIRMATION
  // ============================
  const confirmDeleteLeave = (id: number) => {
    setLeaveToDelete(id);
    setConfirmDelete(true);
  };

  // ============================
  // DELETE
  // ============================
  const handleDelete = async () => {
    if (!leaveToDelete) return;

    try {
      setLoading(true);

      const response =
        await leaveTypesService.DeleteLeaveTypeByAsync(
          leaveToDelete
        );

      if (response[0]?.value === 1) {
        setToast({
          show: true,
          message: response[0]?.message,
          bg: "success",
        });

        await fetchLeaveTypes();
      } else {
        setToast({
          show: true,
          message: response[0]?.message,
          bg: "warning",
        });
      }

      setConfirmDelete(false);
      setLeaveToDelete(null);
    } catch {
      setToast({
        show: true,
        message: "Delete failed.",
        bg: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Container">
      {/* ============================
          PAGE HEADER
      ============================ */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold">Manage Leave Types</h3>

        <Button variant="primary" onClick={openAddModal}>
          {Icon(BsPlus, { className: "me-1" })}
          Add Leave Type
        </Button>
      </div>

      {/* ============================
          LOADING
      ============================ */}
      {loading && (
        <div className="text-center my-3">
          <Spinner animation="border" />
        </div>
      )}

      {/* ============================
          ERROR
      ============================ */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* ============================
          LEAVE TYPES TABLE
      ============================ */}
      <Table className="table table-hover table-dark-custom">
        <thead className="table-light">
          <tr>
            <th>Leave Type</th>
            <th>Description</th>
            <th>Gender</th>
            <th>Active</th>
            <th style={{ width: "140px" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {leaveTypes.length > 0 ? (
            leaveTypes.map((l) => (
              <tr key={l.LeaveTypeID}>
                <td>{l.LeaveTypeName}</td>

                <td>{l.Description}</td>

                <td>
                  {l.Gender === "male" ? (
                    <Badge bg="primary">Male</Badge>
                  ) : l.Gender === "female" ? (
                    <Badge bg="danger">Female</Badge>
                  ) : (
                    <Badge bg="secondary">All</Badge>
                  )}
                </td>

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
                    onClick={() =>
                      confirmDeleteLeave(l.LeaveTypeID)
                    }
                  >
                    {Icon(BsTrash, { size: 16 })}
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            !loading && (
              <tr>
                <td colSpan={5} className="text-center py-4">
                  No leave types found.
                </td>
              </tr>
            )
          )}
        </tbody>
      </Table>

      {/* ============================
          ADD / EDIT MODAL
      ============================ */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSave}
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {leaveFormData.LeaveTypeID === 0
                ? "Add New Leave Type"
                : "Edit Leave Type"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {/* Leave Type Name */}
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Leave Type Name</Form.Label>

                <Form.Control
                  required
                  id="LeaveTypeName"
                  type="text"
                  placeholder="Enter leave type name"
                  value={leaveFormData.LeaveTypeName}
                  onChange={handleInputChange}
                />

                <Form.Control.Feedback type="invalid">
                  Leave Type Name is required.
                </Form.Control.Feedback>
              </Col>
            </Row>

            {/* Description */}
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Description</Form.Label>

                <Form.Control
                  required
                  as="textarea"
                  rows={3}
                  id="Description"
                  placeholder="Enter description"
                  value={leaveFormData.Description}
                  onChange={handleInputChange}
                />

                <Form.Control.Feedback type="invalid">
                  Description is required.
                </Form.Control.Feedback>
              </Col>
            </Row>

            {/* Gender */}
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label>Gender</Form.Label>

                <Form.Select
                  required
                  id="Gender"
                  value={leaveFormData.Gender}
                  onChange={handleInputChange}
                >
                  <option value="">Select Gender</option>
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </Form.Select>

                <Form.Control.Feedback type="invalid">
                  Gender is required.
                </Form.Control.Feedback>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="light"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>

            <Button type="submit" variant="primary">
              {leaveFormData.LeaveTypeID === 0
                ? "Save"
                : "Update"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* ============================
          DELETE CONFIRMATION
      ============================ */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Leave Type?</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          This action cannot be undone. Do you want to delete this
          leave type?
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setConfirmDelete(false)}
          >
            Cancel
          </Button>

          <Button
            variant="danger"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ============================
          TOAST
      ============================ */}
      <ToastContainer
        position="top-end"
        className="p-3"
      >
        <Toast
          bg={toast.bg}
          show={toast.show}
          delay={3000}
          autohide
          onClose={() =>
            setToast({
              ...toast,
              show: false,
            })
          }
        >
          <Toast.Body className="text-white">
            {toast.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default ManageLeaveTypes;
