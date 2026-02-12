import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
} from 'react-bootstrap';
import departmentService from '../../services/departmentService';
import LoggedInUser from '../../types/LoggedInUser';
import Select from 'react-select';

interface Department {
  DepartmentID: number;
  DepartmentName: string;
}

interface Position {
  id: number;
  positionCode: string;
  positionName: string;
  description: string;
  departmentId: number;
  isActive: boolean;
}

const ManagePositions: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState<boolean>(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);
  const [validated, setValidated] = useState(false);

  const userString = localStorage.getItem('user');
  const user: LoggedInUser | null = userString
    ? JSON.parse(userString)
    : null;
  const organizationID = user?.organizationID ?? 0;

  const emptyForm: Position = {
    id: 0,
    positionCode: '',
    positionName: '',
    description: '',
    departmentId: 0,
    isActive: true,
  };

  const [positions, setPositions] = useState<Position[]>([]);
  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [positionFormData, setPositionFormData] =
    useState<Position>(emptyForm);

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [positionToDelete, setPositionToDelete] =
    useState<number | null>(null);

  // Load Departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const res =
          await departmentService.getdepartmentesAsync(
            organizationID
          );
        setDepartments(res?.Table ?? []);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartmentsError('Failed to load departments');
      } finally {
        setLoadingDepartments(false);
      }
    };

    if (organizationID > 0) {
      fetchDepartments();
    }
  }, [organizationID]);

  const handleInputChange = (
    e: React.ChangeEvent<any>
  ) => {
    const { id, value, type } = e.target;

    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setPositionFormData((prev) => ({
        ...prev,
        [id]: target.checked,
      }));
    } else {
      setPositionFormData((prev) => ({
        ...prev,
        [id]:
          id === 'departmentId'
            ? Number(value)
            : value,
      }));
    }
  };

  const openAddModal = () => {
    setEditPosition(null);
    setPositionFormData(emptyForm);
    setValidated(false);
    setShowModal(true);
  };

  const openEditModal = (position: Position) => {
    setEditPosition(position);
    setPositionFormData(position);
    setValidated(false);
    setShowModal(true);
  };

  const handleSave = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const form = event.currentTarget;

    if (
      form.checkValidity() === false ||
      positionFormData.departmentId === 0
    ) {
      event.stopPropagation();
      setValidated(true);
      return;
    }

    if (editPosition) {
      setPositions((prev) =>
        prev.map((p) =>
          p.id === positionFormData.id
            ? positionFormData
            : p
        )
      );
    } else {
      setPositions((prev) => [
        ...prev,
        { ...positionFormData, id: Date.now() },
      ]);
    }

    setShowModal(false);
    setPositionFormData(emptyForm);
    setEditPosition(null);
    setValidated(false);
  };

  const confirmDeletePosition = (id: number) => {
    setPositionToDelete(id);
    setConfirmDelete(true);
  };

  const handleDelete = () => {
    if (positionToDelete !== null) {
      setPositions((prev) =>
        prev.filter((p) => p.id !== positionToDelete)
      );
      setConfirmDelete(false);
      setPositionToDelete(null);
    }
  };

  const getDepartmentName = (
    departmentId: number
  ) =>
    departments.find(
      (d) => d.DepartmentID === departmentId
    )?.DepartmentName || '-';

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Manage Positions</h3>

      <div className="text-end mb-3">
        <Button
          variant="success"
          onClick={openAddModal}
        >
          + Add Position
        </Button>
      </div>

      {positions.length > 0 ? (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Position Code</th>
              <th>Position Name</th>
              <th>Description</th>
              <th>Department</th>
              <th>Is Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td>{p.positionCode}</td>
                <td>{p.positionName}</td>
                <td>{p.description}</td>
                <td>
                  {getDepartmentName(
                    p.departmentId
                  )}
                </td>
                <td>
                  {p.isActive ? 'Yes' : 'No'}
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-2"
                    onClick={() =>
                      openEditModal(p)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() =>
                      confirmDeletePosition(p.id)
                    }
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p className="text-muted">
          No positions added yet.
        </p>
      )}

      {/* Add/Edit Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {editPosition
              ? 'Edit Position'
              : 'Add Position'}
          </Modal.Title>
        </Modal.Header>

        <Form
          noValidate
          validated={validated}
          onSubmit={handleSave}
        >
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="positionCode"
                >
                  <Form.Label>
                    Position Code *
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={positionFormData.positionCode}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter position code.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="positionName"
                >
                  <Form.Label>
                    Position Name *
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={positionFormData.positionName}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter position name.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="departmentId"
                >
                  <Form.Label>Department *</Form.Label>
                  {loadingDepartments ? (
                    <Spinner size="sm" />
                  ) : departmentsError ? (
                    <p className="text-danger">{departmentsError}</p>
                  ) : (
                    <Select
                      options={departments.map((dept) => ({
                        value: dept.DepartmentID,
                        label: dept.DepartmentName,
                      }))}
                      value={
                        positionFormData.departmentId
                          ? {
                              value: positionFormData.departmentId,
                              label: getDepartmentName(positionFormData.departmentId),
                            }
                          : null
                      }
                      onChange={(selectedOption: any) => {
                        setPositionFormData((prev) => ({
                          ...prev,
                          departmentId: selectedOption?.value || 0,
                        }));
                      }}
                      placeholder="Select Department"
                    />
                  )}
                  {validated && positionFormData.departmentId === 0 && (
                    <div className="text-danger mt-1" style={{ fontSize: '0.875em' }}>
                      Please select a department.
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="description"
                >
                  <Form.Label>
                    Description *
                  </Form.Label>
                  <Form.Control
                    required
                    as="textarea"
                    rows={3}
                    value={positionFormData.description}
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type="invalid">
                    Please enter description.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={12}>
                <Form.Group controlId="isActive">
                  <Form.Check
                    type="checkbox"
                    label="Is Active"
                    checked={positionFormData.isActive}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>

          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
            >
              {editPosition ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal
        show={confirmDelete}
        onHide={() => setConfirmDelete(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this position?
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
    </div>
  );
};

export default ManagePositions;
