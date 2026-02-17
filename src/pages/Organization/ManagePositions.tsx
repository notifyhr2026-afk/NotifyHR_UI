import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
} from 'react-bootstrap';
import departmentService from '../../services/departmentService';
import positionService from '../../services/positionService';
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [validated, setValidated] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'danger' | 'warning'>('success');

  const [editPosition, setEditPosition] = useState<Position | null>(null);
  const [positionFormData, setPositionFormData] =
    useState<Position>(emptyForm);

  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [positionToDelete, setPositionToDelete] =
    useState<number | null>(null);

  // ================= LOAD POSITIONS =================
  const loadPositions = async () => {
    try {
      setLoading(true);
      const res = await positionService.getPositionsAsync(organizationID);

      const mapped = res.map((item: any) => ({
        id: item.PositionID,
        positionCode: item.PositionCode,
        positionName: item.PositionTitle,
        description: item.Description,
        departmentId: item.DepartmentID,
        isActive: item.IsActive,
      }));

      setPositions(mapped);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DEPARTMENTS =================
  const loadDepartments = async () => {
    try {
      const res = await departmentService.getdepartmentesAsync(organizationID);
      setDepartments(res?.Table ?? []);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (organizationID > 0) {
      loadDepartments();
      loadPositions();
    }
  }, [organizationID]);

  // ================= INPUT CHANGE =================
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
        [id]: value,
      }));
    }
  };

  // ================= SAVE / UPDATE =================
  const handleSave = async (
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

    try {
      setLoading(true);

      const payload = {
        positionID: positionFormData.id,
        organizationID: organizationID,
        positionCode: positionFormData.positionCode,
        positionTitle: positionFormData.positionName,
        description: positionFormData.description,
        departmentID: positionFormData.departmentId,
        isActive: positionFormData.isActive,
        createdBy:  'Admin',
      };

      const response = await positionService.createOrUpdatePositionAsync(payload);

      if (response.length > 0) {
        const result = response[0];

        if (result.value === 1) {
          setMessage(result.MSG);
          setMessageType('success');
          loadPositions();
          setShowModal(false);
          setPositionFormData(emptyForm);
          setEditPosition(null);
        } else {
          setMessage(result.MSG);
          setMessageType('warning');
        }
      }
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong');
      setMessageType('danger');
    } finally {
      setLoading(false);
      setValidated(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async () => {
    if (!positionToDelete) return;

    try {
      setLoading(true);
      const response = await positionService.deletePositionAsync(positionToDelete);

      if (response.length > 0) {
        const result = response[0];

        if (result.value === 1) {
          setMessage(result.MSG);
          setMessageType('success');
          loadPositions();
        } else {
          setMessage(result.MSG);
          setMessageType('warning');
        }
      }
    } catch (error) {
      console.error(error);
      setMessage('Delete failed');
      setMessageType('danger');
    } finally {
      setConfirmDelete(false);
      setPositionToDelete(null);
      setLoading(false);
    }
  };

  const getDepartmentName = (departmentId: number) =>
    departments.find((d) => d.DepartmentID === departmentId)
      ?.DepartmentName || '-';

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Manage Positions</h3>

      {message && (
        <Alert
          variant={messageType}
          onClose={() => setMessage(null)}
          dismissible
        >
          {message}
        </Alert>
      )}

      <div className="text-end mb-3">
        <Button variant="success" onClick={() => {
          setEditPosition(null);
          setPositionFormData(emptyForm);
          setShowModal(true);
        }}>
          + Add Position
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : positions.length > 0 ? (
        <Table bordered hover responsive>
          <thead className="table-light">
            <tr>
              <th>Code</th>
              <th>Name</th>
              <th>Description</th>
              <th>Department</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.id}>
                <td>{p.positionCode}</td>
                <td>{p.positionName}</td>
                <td>{p.description}</td>
                <td>{getDepartmentName(p.departmentId)}</td>
                <td>{p.isActive ? 'Yes' : 'No'}</td>
                <td>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="me-2"
                    onClick={() => {
                      setEditPosition(p);
                      setPositionFormData(p);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => {
                      setPositionToDelete(p.id);
                      setConfirmDelete(true);
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No positions found.</p>
      )}

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {editPosition ? 'Update Position' : 'Add Position'}
          </Modal.Title>
        </Modal.Header>

        <Form noValidate validated={validated} onSubmit={handleSave}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group controlId="positionCode" className="mb-3">
                  <Form.Label>Code *</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={positionFormData.positionCode}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="positionName" className="mb-3">
                  <Form.Label>Name *</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={positionFormData.positionName}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Department *</Form.Label>
              <Select
                options={departments.map((d) => ({
                  value: d.DepartmentID,
                  label: d.DepartmentName,
                }))}
                value={
                  positionFormData.departmentId
                    ? {
                        value: positionFormData.departmentId,
                        label: getDepartmentName(positionFormData.departmentId),
                      }
                    : null
                }
                onChange={(option: any) =>
                  setPositionFormData((prev) => ({
                    ...prev,
                    departmentId: option?.value || 0,
                  }))
                }
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description *</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                value={positionFormData.description}
                onChange={handleInputChange}
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="isActive"
              label="Is Active"
              checked={positionFormData.isActive}
              onChange={handleInputChange}
            />
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editPosition ? 'Update' : 'Save'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Delete Modal */}
      <Modal show={confirmDelete} onHide={() => setConfirmDelete(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this position?
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

export default ManagePositions;
